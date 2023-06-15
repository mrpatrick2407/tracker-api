
const intial=db.issues.count();
var randomParagraph = require('random-paragraph');

const owners = ['Ravan', 'Eddie', 'Pieta', 'Parvati', 'Victor'];
const statuses = ['New', 'Assigned', 'Fixed', 'Closed'];
for ( let  i=0;i<100;i++){
    const randomcreated=(new Date())-Math.floor(Math.random()*60)*1000*60*60*24;
    const randomdue=(new Date())-Math.floor(Math.random()*60)*1000*60*60*24;
    const created =new Date(randomcreated);
    const due =new Date(randomdue);
    const owner = owners[Math.floor(Math.random()*5)];
    const status = statuses[Math.floor(Math.random()*4)];
    const effort = Math.ceil(Math.random()*20);
    const title = `Lorem ipsum dolor sit amet, ${i}`;
    const id=intial+i+1;
    const description=randomParagraph({ sentences: 2 }).toString();
    const issue={
        id,due,created,owner,status,effort,title,description
    }
    db.issues.insertOne(issue);
    const count2 = db.issues.count();
db.counters.update({ _id: 'issues' }, { $set: { current: count2 } });
}
