require('dotenv').config();

//Express
const express = require('express');
const app = express();
const db = require('./db');
db.sequelize.sync();

//Variable Declarations
const http = require('http');
const secret = process.env.JWT_SECRET;
const secret2 = process.env.JWT_SECRET2;

//Apollo
const { ApolloServer } = require('apollo-server-express');
const addUser = require('./addUser');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req, res }) => {
		return {
			req,
			res,
			db,
			secret,
			secret2
		};
	},
	subscriptions: {
		onConnect: async ({ token, refreshToken }, webSocket) => {
			console.log('💥💥💥 WEBSOCKET CONNECTED 💥💥💥');
			if (token && refreshToken) {
				try {
					const { user } = jwt.verify(token, secret);
					return { db, user };
				} catch (err) {
					const newTokens = await refreshTokens(token, refreshToken, db, secret, secret2);
					return { db, user: newTokens.user };
				}
			}
			return { db };
		},
		onDisconnect: (webSocket, context) => {
			console.log('Disconnected.');
		}
	}
});

//Express Middleware
app.use(require('express').json());
app.use(addUser);
server.applyMiddleware({ app });

//HttpServer for websocket subscriptions
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(process.env.PORT, () =>
	console.log(`🚀🚀🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath} 🚀🚀🚀`)
);
