const secret = process.env.JWT_SECRET;
const secret2 = process.env.JWT_SECRET2;
const jwt = require('jsonwebtoken');
const { refreshTokens } = require('./auth');
const db = require('./db');

//Function to check if a user has valid tokens to allow access to GraphQL resolvers
module.exports = async function addUser(req, res, next) {
	const token = req.headers['x-token'];
	if (token) {
		try {
			const { id } = await jwt.verify(token, secret);
			req.user = id;
		} catch (err) {
			const refreshToken = req.headers['x-refresh-token'];
			const newTokens = await refreshTokens(token, refreshToken, db, secret, secret2);
			if (newTokens.token && newTokens.refreshToken) {
				res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
				res.set('x-token', newTokens.token);
				res.set('x-refresh-token', newTokens.refreshToken);
			}
			req.user = newTokens.user;
		}
	}
	next();
};
