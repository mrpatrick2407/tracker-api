const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const GraphQLDate = new GraphQLScalarType({
    name: 'GraphqlDate',
    description: 'To retrieve the date in string format i serialize it',
    serialize(val) { return val.toISOString(); },
    parseValue(value) {
      const dateValue = new Date(value); return isNaN(dateValue) ? undefined : dateValue;
    },
    parseLiteral(ast) {
      if (ast.kind == Kind.STRING) { const value = new Date(ast.value); return isNaN(value) ? undefined : value; }
    },
  });
  module.exports=GraphQLDate;