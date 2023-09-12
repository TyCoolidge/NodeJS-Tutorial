const { buildSchema } = require('graphql');

// module.exports = buildSchema(`
//   type TestData {
//     text: String!
//     views: Int!
//   }

//   type RootQuery {
//     hello: TestData!
//   }

//   schema {
//     query: RootQuery
//   }
// `);

module.exports = buildSchema(`
  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatededAt: String!
  }

  type User {
    _id: ID!
    email: String!
    name: String!
    password: String!
    status: String!
    posts: [Post!]!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }

  type AuthData {
    token: String!
    userId: String!
  }

  type PostsData {
    posts: [Post!]!
    totalItems: Int!
  }

  type RootQuery {
    login(email: String!, password: String!): AuthData!
    getPosts(page: Int!): PostsData!
    getPost(_id: ID!): Post!
    user: User!
  }

  input PostInputData {
    title: String!
    imageUrl: String!
    content: String!
  }

  type RootMutation {
    createUser(userInput: UserInputData): User!
    createPost(postInput: PostInputData): Post!
    updatePost(_id: ID!, postInput: PostInputData): Post!
    deletePost(_id: ID!): Boolean
    updateStatus(status: String!): User!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  } 
`);
