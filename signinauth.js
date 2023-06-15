const Router=require('express')
const {OAuth2Client} = require('google-auth-library');
const bodyParser=require('body-parser')
const {AuthenticationError} =require('apollo-server-express')

const routes=new Router()
const clientId=process.env.GOOGLE_CLIENT_ID
const client = new OAuth2Client(clientId);
const jwt=require('jsonwebtoken');
const cors=require('cors')


let {JWT_SECRET}=process.env;

if (!JWT_SECRET) {
 
  JWT_SECRET = 'tempjwtsecretfordevonlytempjwtsecretfordevonly';
  
 }

 routes.post('/signout',(req,res)=>{
     res.clearCookie('jwt')
     res.json({signedIn:false})
 
 })

 routes.use(cors({
    origin: 'http://localhost:8000',
    credentials: true
  }))
routes.use(bodyParser.json())

function mustbesignedin(resolver){
  return (root, args, context) => {
    console.log(context.signedIn + " status in must be signed in");
    if (!context.signedIn) {
      throw new AuthenticationError("You must be signed in");
    }
    return resolver(root, args, context);
  };
}

function getUser(req) {
    //console.log(req.headers.cookie)
    let token = req.headers.cookie.jwt;
    if (req.headers && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.startsWith('jwt=')) {
            token = cookie.substring(4); // Extract the token value after 'jwt='
            break;
          }
        }
      }
      console.log(token)
    try {
    const credentials = jwt.verify(token, "JWT_SECRET");
    console.log(JSON.stringify(credentials))
    return credentials;
    } catch (error) {
      console.log("Error started"+error)
    return { signedIn: false };
    }
    
}
routes.get('/signin',(req,res)=>{
    res.send("Hello")
})
routes.post('/signin',async (req,res)=>{
const google_token=req.body.google_token;
if (!JWT_SECRET) {
    res.status(500).send('Missing JWT_SECRET. Refusing to authenticate');
    }
        if(!google_token){
            res.status(400).send({code:400,message:"Invalid token"})
        }
            try {
                
    console.log("In here")

                const ticket = await client.verifyIdToken({idToken:google_token,audience:clientId});
                const payload=ticket.getPayload();
                const {given_name,picture,name,email}=payload;
                //console.log(given_name+" "+name+" "+email+" "+picture)
                const credentials={signedIn:true,givenName:given_name,email:email,image:picture,name:name}
                const token=jwt.sign(credentials,"JWT_SECRET",{expiresIn:'1h'})
                res.cookie('jwt',token,{httpOnly:true})
                res.json(credentials)
            } catch (error) {
                
    console.log("error" + error)

                res.status(400).send({signedIn:false})
            }
        
    }
    
)



routes.post('/user', (req, res) => {
    res.send(getUser(req));
    });
module.exports={routes,getUser,mustbesignedin}