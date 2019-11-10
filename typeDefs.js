const { gql } = require('apollo-server-express');
module.exports = gql`
	type Query {
		getAllUsers: [User!]!
		getMessagesFromConvo(convoId: ID!): ChatMessagesResponse!
		getConvos: ConvosResponse!
	}
	type Mutation {
		#User
		createUser(name: String!, email: String!, password: String!, username: String!): UserResponse!
		loginUser(username: String!, password: String!): LoginResponse!
		# Convo
		createConvo(otherUserId: String!): CreateConvoResponse!
		createMessage(convoId: ID!, text: String!): CreateMessageResponse!
		deleteAllMessagesFromConvo(convoId: ID): String!
	}
	# Users
	type User {
		id: ID!
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
	type Convo {
		id: ID!
		updatedAt: String!
		createdAt: String!
	}
	type CreateConvoResponse {
		ok: Boolean!
		convo: Convo!
		errors: [Error!]
	}
	type Message {
		id: ID!
		userId: ID
		convoId: ID!
		text: String!
		updatedAt: String!
		createdAt: String!
	}
	type ChatMessagesResponse {
		ok: Boolean!
		messages: [Message!]!
		errors: [Error!]
	}
	type CreateMessageResponse {
		ok: Boolean!
		message: Message!
		errors: [Error!]
	}
	type ConvosResponse {
		ok: Boolean!
		convos: [Convo!]!
		errors: [Error!]
	}
	type Member {
		userId: String!
		convoId: String!
	}
	type Subscription {
		newMessage(convoId: String!): CreateMessageResponse!
	}
`;
