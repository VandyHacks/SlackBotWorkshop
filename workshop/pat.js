
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


app.command("/pat",async ({command,ack,client,context})=>{
  await ack();
  try{
    console.log("command is \n"+command);
    console.log("client is \n"+client);
    console.log("contest is \n"+context);
    
    
  }catch(error){
  
  }
});














(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();



