const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    locale: String!
    posts: [Post!]!
    updatedAt: Int
    createdAt: Int
  }
  type Post {
    id: ID!
    title: String!
    lead: String!
    content: String!
    sources: String
    userId: ID!
    user: User!
    updatedAt: String
    createdAt: String
    canEdit: Boolean
    canDelete: Boolean
  }
  type Source {
    type: String!
    title: String!
    author: String
    url: String
  }
  type Query {
    latestPosts(count: Int!, after: Int): [Post!]
    postsAfterTimestamp(timestamp: Int!): [Post!]
    post(id: ID!): Post
    user(id: ID!): User
    me: User!
  }
  type Mutation {
    createPost(
      title: String!
      lead: String
      content: String!
      sources: [Source!]
    ): Post!
    updatePost(
      id: Int!
      title: String!
      lead: String
      content: String!
      sources: [Source!]
    ): Post!
    deletePost(id: Int!): Int!
  }
`;
