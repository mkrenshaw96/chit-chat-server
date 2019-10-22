const bcrypt = require('bcryptjs');
const { tryLogin } = require('./auth');
const requiresAuth = require('./permissions');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const NEW_MESSAGE = 'NEW_MESSAGE';

module.exports = {
	Subscription: {
		newMessage: {
			subscribe: async (parent, args, { pubsub }) => await pubsub.asyncIterator([NEW_MESSAGE])
		}
	},
	Query: {
		test: (parent, args, context) => 'This works',
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
		getConvos: (parent, args, { db, req }) => {
			try {
				const convos = db.CONVO.findAll({ where: { [Op.or]: [{ user2Id: req.user }, { user1Id: req.user }] } });
				return {
					ok: true,
					convos
				};
			} catch (err) {
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
		createConvo: requiresAuth.createResolver(async (parent, args, { db, req }) => {
			try {
				//FOR TESTING User1 is Mike, User2 is shrek
				const convo = await db.CONVO.create({ user1Id: req.user, user2Id: '3b993e75-009e-4b0d-8061-32302d370fcb' });
				return {
					ok: true,
					convo
				};
			} catch (err) {
				return {
					ok: false,
					error: err.message
				};
			}
		}),
		createMessage: async (parent, { text, convoId }, { db, pubsub }) => {
			try {
				const message = await db.USER.findOne({ where: { id: 'c93d4ae4-91f4-4e37-b892-48b5c4721cda' } }).then(foundUser =>
					foundUser.createMessage({ text, convoId })
				);
				await pubsub.publish(NEW_MESSAGE, { newMessage: message });
				return {
					ok: true,
					message
				};
			} catch (err) {
				return {
					ok: false,
					error: err.message
				};
			}
		}
	}
};
