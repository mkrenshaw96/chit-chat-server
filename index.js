require('dotenv').config();

//Express
const express = require('express');
const app = express();
const db = require('./db');

//Variable Declarations
const secret = process.env.JWT_SECRET;
const secret2 = process.env.JWT_SECRET2;

//Apollo
const { ApolloServer } = require('apollo-server-express');
const addUser = require('./addUser');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

db.sequelize.sync();

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
	}
});

//Express Middleware
app.use(require('express').json());
app.use(addUser);
server.applyMiddleware({ app });

app.listen(process.env.PORT, () => console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`));
