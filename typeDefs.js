const { gql } = require('apollo-server-express');

module.exports = gql`
	type Query {
		test: String!
		getAllUsers: [User!]!
	}
	type Mutation {
		createUser(name: String!, email: String!, password: String!, username: String!): UserResponse!
		loginUser(username: String!, password: String!): LoginResponse!
	}
	# Users
	type User {
		id: String!
		name: String!
		email: String!
		username: String!
	}
	type UserResponse {
		ok: Boolean!
		user: User
		err: String
	}
	type LoginResponse {
		ok: Boolean!
		token: String
		refreshToken: String
		user: User
		errors: [Error!]
	}
	type Error {
		path: String!
		message: String
	}
`;
