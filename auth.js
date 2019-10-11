const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const tryLogin = async (username, password, db, tokenSecret, secret2) => {
	const user = await db.USER.findOne({
		where: {
			username
		}
	});

	if (!user) {
		return {
			ok: false,
			errors: [{ path: 'username', message: 'Username is not valid.' }]
		};
	}

	const valid = await bcrypt.compare(password, user.password);
	if (!valid) {
		return {
			ok: false,
			errors: [{ path: 'password', message: 'Password is not valid.' }]
		};
	}

	const refreshTokenSecret = user.password + secret2;

	const [token, refreshToken] = await createTokens(user, tokenSecret, refreshTokenSecret);

	return {
		ok: true,
		user,
		token,
		refreshToken
	};
};

const createTokens = async (user, tokenSecret, refreshTokenSecret) => {
	//Expires every 20mins
	const createToken = await jwt.sign({ id: user.id }, tokenSecret, { expiresIn: '20m' });
	//Able to refresh and generate a new token for 7 days before experation
	const createRefreshToken = await jwt.sign({ id: user.id }, refreshTokenSecret, { expiresIn: '7d' });
	return [createToken, createRefreshToken];
};

const refreshTokens = async (token, refreshToken, db, tokenSecret, refreshTokenSecret) => {
	var id;
	try {
		var { id } = jwt.decode(refreshToken);
		var userId = id;
	} catch (err) {
		return {};
	}

	if (!userId) {
		return {};
	}

	const user = await db.USER.findOne({
		where: {
			id: userId
		},
		raw: true
	});

	if (!user) {
		return {};
	}

	const refreshSecret = user.password + refreshTokenSecret;

	try {
		jwt.verify(refreshToken, refreshSecret);
	} catch (err) {
		return {};
	}

	const [newToken, newRefreshToken] = await createTokens(user, tokenSecret, refreshSecret);
	return {
		token: newToken,
		refreshToken: newRefreshToken,
		user: user.id
	};
};

module.exports = { createTokens, refreshTokens, tryLogin };
