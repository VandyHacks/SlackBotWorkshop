// This example shows how to listen to a button click
// It uses slash commands and actions
// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listen for a '/pat' slash command invocation
// It will post a scheduled message in the channel you called the slash command
app.command("/pat", async ({ command, ack, client, context }) => {
  // Acknowledge incoming command event
  ack();

  //expect format "01 Jan 1970 00:00:00 GMT , message"
  try {
    let commands = command.text;
    let indx = commands.indexOf(`,`);
    if (indx < 0) {
      //if parsing failed
      throw "no comma found";
    }
    let time = Date.parse(commands.substring(0, indx));
    console.log("Command /pat2 recieved parameters " + commands);

    // Call the chat.scheduleMessage method using the built-in WebClient
    const result = await client.chat.scheduleMessage({
      // The token you used to initalize the app
      token: context.botToken,
      channel: command.channel_id,
      text: commands.substring(indx + 1),
      // Time to post message, in Unix Epoch timestamp format
      post_at: time / 1000
    });

    let confirmation = `pat pat, your reminder is set at ${new Date(
      time
    ).toLocaleTimeString("en-US")} UTC`; // confirmation message

    //give user a private confirmation message
    await client.chat.postEphemeral({
      // The token you used to initialize your app is stored in the `context` object
      token: context.botToken,
      // Payload message should be posted in the channel where '/pat' was heard
      channel: command.channel_id,
      // The user the message should appear for
      user: command.user_id,
      text: confirmation
    });
    console.log(confirmation);
    // Print result
    console.log(result);
  } catch (error) {
    console.error(error);

    // send sender a private error message
    await client.chat.postEphemeral({
      token: context.botToken,
      // The channel where '/pat' was heard
      channel: command.channel_id,
      // The user the message should appear for
      user: command.user_id,
      text: `Can't parse your request. Error: ${error} \nMake sure it's in format "/pat2 [timeString] , [message]"`
    });
  }
});

















(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();



