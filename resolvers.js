const bcrypt = require('bcryptjs');
const { tryLogin } = require('./auth');
const requiresAuth = require('./permissions');
module.exports = {
	Query: {
		test: (parent, args, context) => 'This works',
		getAllUsers: (parent, args, { db }) => db.USER.findAll()
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
		}
		//For user when creating routes that require authorization of the user
		// createConvo: requiresAuth.createResolver(async (parent, args, context) => {
		// 	return null;
		// })
	}
};
