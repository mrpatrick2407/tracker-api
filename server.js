const express = require('express');
// getting ApolloServer object from the package
const { ApolloServer, UserInputError } = require('apollo-server-express');
const GraphQLDate=require('./graphqldate')
const { MongoClient, Int32 } = require('mongodb');
// file sync
const fs = require('fs');
// Issues
require('dotenv').config();
const about=require('./aboutmessage')
const auth=require('./signinauth.js')
const cookieParser= require('cookie-parser');

const app = express();
app.use('/auth',auth.routes)
app.use(cookieParser());
let cors;
if (true) {
const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:8000';
const methods = 'POST';
cors = { origin, methods, credentials: true };
} else {
cors = 'false';
}


const enable = process.env.ENABLE_CORS || true;
let db;

const url = process.env.DB_URL || 'mongodb+srv://theophilus:kritheo2420@cluster0.5ggmpye.mongodb.net/?retryWrites=true&w=majority';
// resolvers
const port = process.env.API_SERVER || 3000;

// function start
// IssuesStore function
async function issueCount(_,{status,effortmin,effortmax}){
  const filter={};
  if(status){
    filter.status=status;
  }
  if(effortmin!==undefined ||effortmax!==undefined){
    filter.effort={};
    if(effortmax!==undefined){
      filter.effort.$gte=effortmin;
    }
    if(effortmin!==undefined){
      filter.effort.$lte=effortmax;
    }
  }
  

    const results=await db.collection('issues').aggregate([{$match:filter},{$group:{_id:{owner:'$owner',status:'$status'},count:{$sum:1}}}]).toArray();
    const stats = {};
    results.forEach((result) => {
    // eslint-disable-next-line no-underscore-dangle
    const { owner, status: statusKey } = result._id;
    if (!stats[owner]) stats[owner] = { owner };
    stats[owner][statusKey] = result.count;
    });
    return Object.values(stats);
}

async function issueList(_,{status,search,effortmin,effortmax,page=1}) {
  const PAGE_SIZE=10;
  const filter={};
  if(status){
    filter.status=status;
  }
  if(effortmin!==undefined ||effortmax!==undefined){
    filter.effort={};
    if(effortmax!==undefined){
      filter.effort.$gte=effortmin;
    }
    if(effortmin!==undefined){
      filter.effort.$lte=effortmax;
    }
  }
if(search){
  filter.$text={$search:search};
}

  const cursor = await db.collection('issues').find(filter).sort({id:1}).skip(PAGE_SIZE*(page-1)).limit(PAGE_SIZE);
 
  const totalCount = await db.collection('issues').countDocuments(filter);
  const issuesDb=await cursor.toArray()
  var pages=Math.ceil(totalCount/PAGE_SIZE);
  exports.issuesDb = issuesDb;
 
  return {issuesDb,pages};
}

async function issueDelete(_,{id}){
  const issue = await db.collection('issues').findOne({id});
  if(issue){
    issue.deleted=new Date();
    const res= await db.collection('issuesdeleted').insertOne({issue});
    if(res){
      const del= await db.collection('issues').deleteOne({id});
      if(del){
        const result = await db.collection('counters').findOneAndUpdate({ _id: 'issues' }, { $inc: { current: -1 } }, { returnOriginal: false });

        return true
      }else{
        return false;
      }
    }
    else{
      return false;
    }
  }else{
    return false;
  }
}


async function connecttodb() {
  const client = new MongoClient(url);
  await client.connect();
  console.log('Connected to MongodbAtlas');
  db = client.db('issuetracker');
}

async function issue(_, { id }) {
  const issue = await db.collection('issues').findOne({ id: id });
  return issue;
}

function validateIssue(_, { issue }) { const errors = []; if (issue.title.length < 3) { errors.push('Field "title" must be at least 3 characters long.'); } if (issue.status == 'Assigned' && !issue.owner) { errors.push('Field "owner" is required when status is "Assigned"'); } if (errors.length > 0) { throw new UserInputError('Invalid input(s)', { errors }); } }

function getContext({req}){
  const {signedIn}=auth.getUser(req)
  console.log("this s signed i n status"+signedIn)
  return {signedIn};

}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate({ _id: name }, { $inc: { current: 1 } }, { returnOriginal: false });
  return result.value.current+1;
}

async function issueAdd(_, { issue }) {
  const newissues = {
    id: await getNextSequence('issues'),
    title: issue.title,
    created: new Date(),
    owner: issue.owner,
  };
  const res = await db.collection('issues').insertOne(newissues);

  const savedIssue = await db.collection('issues').findOne({ _id: res.insertedId });
  return savedIssue;
}


async function issueUpdate(_,{id,Changes}){
  if(Changes.title||Changes.status||Changes.owner ||Changes.description){
    const issue = await db.collection('issues').findOne({ id: id})
    Object.assign(issue,Changes)

  }
  await db.collection('issues').updateOne({id: id},{$set:Changes})
  const savedissue=await db.collection('issues').findOne({id: id});
  return savedissue;
}
// function e
const resolvers = {
  Query: {
    about:about.getaboutMessage ,
    issueList,
    issueAdd,
    examplethrow: (_, { a, b }) => {
      const val = a + b;
      exports.val = val;
      return a + b;
    },
    issue,
    examplecatchfromquery: () => {
      const { val } = exports;
      return val;
    },
    issueCount
  },
  Mutation: {
    setAboutMessage:auth.mustbesignedin( about.setAboutMessage),
    issueUpdate:auth.mustbesignedin(issueUpdate),
  issueDelete:auth.mustbesignedin(issueDelete),

    examplecatchfrommutation: auth.mustbesignedin(() => {
      const { val } = exports;
      return val;
    },)
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
  context:getContext
});



async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql', cors });
}

startServer().then(async () => {
  await connecttodb();
  app.listen(port, () => console.log('Running on 3000'));
});
