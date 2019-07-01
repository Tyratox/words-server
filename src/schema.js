const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    locale: String!
    posts: [Post!]!
  }
  type Post {
    id: ID!
    title: String!
    lead: String!
    content: String!
    sources: String
    userId: ID!
    user: User!
  }
  type Query {
    latestPosts(count: Int!): [Post!]
    postsAfterTimestamp(timestamp: Int!): [Post!]
    post(id: ID!): Post
    user(id: ID!): User
    me: User!
  }
  type Mutation {
    createPost(title: String!, lead: String, content: String!): Post!
    updatePost(id: ID!, title: String!, lead: String!, content: String!): Post!
    deletePost(id: ID!): Int!
  }
`;
