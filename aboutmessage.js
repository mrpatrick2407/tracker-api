let aboutMessage = 'Issue Tracker API v1.0';

function setAboutMessage(_, { message }) {
    return (aboutMessage = message);
  }
function getaboutMessage(){
    return aboutMessage;
}
module.exports={setAboutMessage,getaboutMessage}