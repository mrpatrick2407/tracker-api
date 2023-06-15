const { MongoClient } = require('mongodb');

let db;
async function connecttodb() {
    const client = new MongoClient(url);
    await client.connect();
    console.log('Connected to MongodbAtlas');
    db = client.db('issuetracker');
  }
  
  
  
  function validateIssue(_, { issue }) { const errors = []; if (issue.title.length < 3) { errors.push('Field "title" must be at least 3 characters long.'); } if (issue.status == 'Assigned' && !issue.owner) { errors.push('Field "owner" is required when status is "Assigned"'); } if (errors.length > 0) { throw new UserInputError('Invalid input(s)', { errors }); } }
  
  async function getNextSequence(name) {
    const result = await db.collection('counters').findOneAndUpdate({ _id: name }, { $inc: { current: 1 } }, { returnOriginal: false });
    console.log(result);
    return result.value.current;
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
  async function issueList(_,{status}) {
    const filter={};
    if(status){ 
      filter.status = status; 
    }
    const issuesDb = await db.collection('issues').find(filter).toArray();
    console.log(`This is frm issuelist1${issuesDb}`);
    exports.issuesDb = issuesDb;
    console.log(`This is frm issuelist${issuesDb}`);
    return issuesDb;
  }
module.exports={issueAdd,issueList}  