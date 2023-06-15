db.issues.remove({});


const issuesDb = [{
  id: 1, status: 'New', owner: 'Theo', effort: 5, created: new Date('2018-08-16'), due: null, title: 'Error in console',
  description: 'Steps to recreate the problem:' + '\n1. Refresh the browser.' + '\n2. Select "New" in the filter' + '\n3. Refresh the browser again. Note the warning in the console:' + '\n   Warning: Hash history cannot PUSH the same path; a new entry' + '\n   will not be added to the history stack' + '\n4. Click on Add.' + '\n5. There is an error in console, and add doesn\'t work.',},
{
  id: 2, status: 'Assigned', owner: 'Eddie', effort: 14, created: new Date('2018-08-16'), due: new Date('2018-08-30'), title: 'Missing bottom border on panel',
  description: 'There needs to be a border in the bottom in the panel' + ' that appears when clicking on Add',},
];


db.issues.insertMany(issuesDb);
const count = db.issues.count();
console.log(`Inserted:${count}issues`);
db.counters.remove({ _id: 'issues' });
db.counters.insertOne({ _id: 'issues', current: count });
db.issues.createIndex({ id: 1 }, { unique: true });
db.issues.createIndex({ status: 1 });
db.issues.createIndex({ created: 1 });
db.issues.createIndex({ owner: 1 });
const issue=db.issues.find({ });

//const issues=db.issues.deleteOne({ id: 2});
//console.log("deleted"+issues.deletedCount+"sd");
console.log(issue);
db.myFirstDatabase.remove({})
//connect :mongosh "mongodb+srv://cluster0.5ggmpye.mongodb.net/issuetracker" --apiVersion 1 --username theophilus .\init.mongo.js