
const express = require('express');
const app = express();
const { ApolloServer } = require('apollo-server-express');
const GraphQLDate=require('./graphqldate')
// file sync
const fs = require('fs');
// Issues
require('dotenv').config();
const about=require('./aboutmessage')
const issue=require('./issue')

const resolvers = {
    Query: {
      about:about.getaboutMessage ,
      issueList:issue.issueList,
      issueAdd:issue.issueAdd,
      examplethrow: (_, { a, b }) => {
        const val = a + b;
        exports.val = val;
        return a + b;
      },
  
      examplecatchfromquery: () => {
        const { val } = exports;
        return val;
      },
    },
    Mutation: {
      setAboutMessage:about.setAboutMessage,
  
      examplecatchfrommutation: () => {
        const { val } = exports;
        return val;
      },
    },
    GraphQLDate,
  };
  
  // INstantiating the ApolloServer
  const server = new ApolloServer({
    typeDefs: fs.readFileSync('schema.graphql', 'utf-8'),
    resolvers,
    formatError: (error) => {
      console.log(error);
      return error;
    },
  });
  
  async function startServer() {
    await server.start();
    server.applyMiddleware({ app, path: '/graphql', cors: false });
  }
  module.exports=startServer;