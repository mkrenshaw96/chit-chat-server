const bcrypt = require('bcryptjs');
const { tryLogin } = require('./auth');
const requiresAuth = require('./permissions');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { withFilter, PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();
const NEW_MESSAGE = 'NEW_MESSAGE';

module.exports = {
	Subscription: {
		newMessage: {
			subscribe: withFilter(
				() => pubsub.asyncIterator([NEW_MESSAGE]),
				(payload, { convoId }) => payload.convoId === convoId
			)
		}
	},
	Query: {
		getAllUsers: (parent, args, { db }) => db.USER.findAll(),
		getMessagesFromConvo: async (parent, { convoId }, { db }) => {
			try {
				const messages = await db.MESSAGE.findAll({ where: { convoId }, order: [['createdAt', 'ASC']] });
				return {
					ok: true,
					messages
				};
			} catch (err) {
				return {
					ok: false,
					error: err.message
				};
			}
		},
		getConvos: async (parent, args, { db, req }) => {
			try {
				const convos = await db.USER.findOne({ where: { id: req.user } }).then(foundUser => foundUser.getConvos());
				return {
					ok: true,
					convos
				};
			} catch (err) {
				console.log(err);
				return {
					ok: false,
					error: err.message
				};
			}
		}
	},
	Mutation: {
		createUser: async (parent, args, { db }) => {
			try {
				const user = await db.USER.create({ ...args, password: bcrypt.hashSync(args.password) });
				return {
					ok: true,
					user
				};
			} catch (err) {
				return {
					ok: false,
					error: err.message
				};
			}
		},
		loginUser: async (parent, { username, password }, { db, secret, secret2 }) => {
			return tryLogin(username, password, db, secret, secret2);
		},
		createConvo: async (parent, { otherUserId }, { db, req }) => {
			try {
				const convo = await db.CONVO.create();
				await convo.addUsers([req.user, otherUserId]);
				return {
					ok: true,
					convo
				};
			} catch (err) {
				console.log(err);
				return {
					ok: false,
					error: err.message
				};
			}
		},
		createMessage: async (parent, { text, convoId }, { db, req }) => {
			try {
				const message = await db.USER.findOne({ where: { id: req.user } }).then(foundUser =>
					foundUser.createMessage({ text, convoId })
				);
				await pubsub.publish(NEW_MESSAGE, { convoId, newMessage: message });
				return {
					ok: true,
					message
				};
			} catch (err) {
				console.log(err);
				return {
					ok: false,
					error: err.message
				};
			}
		}
	}
};
