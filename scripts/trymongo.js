const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://theophilus:kritheo2420@cluster0.5ggmpye.mongodb.net/?retryWrites=true&w=majority';
// Atlas URL  - replace UUU with user, PPP with password, XXX with hostname // const url = 'mongodb+srv://UUU:PPP@cluster0-XXX.mongodb.net/issuetracker?retryWrites=true'; // mLab URL - replace UUU with user, PPP with password, XXX with hostname // const url = 'mongodb://UUU:PPP@XXX.mlab.com:33533/issuetracker';
function test(callback) {
  console.log('-----testing with callbacks--\n');
  const client = new MongoClient(url);
  client.connect((err, client) => {
    if (err) {
      callback(err);
      return;
    }
    console.log('Connected to Mongooo fireeeeehhh');
    const db = client.db('issuetracker');
    const collection = db.collection('employees');
    const employee = { id: 1, name: 'philus', role: 'admin' };
    collection.remove({ id: 1 }, (err) => {
      if (err) {
        client.close();
        callback(err);
        return;
      }console.log('removed');
    });
    collection.insertOne(employee, (err, res) => {
      if (err) {
        client.close();
        callback(err);
        return;
      }
      console.log(res.insertedId);
      collection.find({ id: 1 }).toArray((err, docs) => {
        if (err) {
          client.close();
          callback(err);
          return;
        }
        console.log(docs);
        client.close();
        callback(err);
      });
    });
  });
}

async function testwithasync() {
  const client = new MongoClient(url);

  try {
    console.log('-----testing with callbacks--\n');
    await client.connect();
    console.log('Connected to Mongooo fireeeeehhh');
    const db = client.db('issuetracker');
    const collection = db.collection('employees');
    const employee = { id: 2, name: 'philus', role: 'admin' };

    const res = await collection.insertOne(employee);

    console.log(res.insertedId);
    const docs = await collection.find({}).toArray();
    console.log(docs);
    await client.close();
    console.log('disconnected');
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
}

testwithasync();
