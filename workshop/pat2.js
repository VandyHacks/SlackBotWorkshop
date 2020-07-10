
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});



// Listen for a '/pat2' slash command invocation
// It will set up a reminder through default Slackbot
// It allows adding a @someone
// USER_TOKEN
app.command("/pat2", async ({ command, ack, say, client, context }) => {
  // Acknowledge incoming command event
  ack();

  try {
    let arg = command.text.trim();
    let userInd1 = arg.indexOf(`<@`);
    let userInd2 = arg.indexOf(`>`);
    let userInd3 = arg.indexOf(`|`);

    let user = command.user_id;
    let username = "yourself";

    if (userInd1 != -1 && userInd2 != -1) {
      user = arg.substring(userInd1 + 2, userInd3);
      username = arg.substring(userInd3 + 1, userInd2);
      arg = arg.substring(0, userInd1) + arg.substring(userInd2 + 1);
    }

    let ind = arg.indexOf(`,`);

    if (ind == -1) {
      // Call the chat.postEphemeral method using the built-in WebClient
      const result = await client.chat.postEphemeral({
        // The token you used to initialize your app is stored in the `context` object
        token: context.botToken,
        attachments: [
          {
            text:
              "Some examples that work for the time field includes: `1458678068`, `20`, `in 5 minutes`, `tomorrow`, `at 3:30pm`, `on Tuesday`, or `next week`."
          }
        ],
        // Payload message should be posted in the channel where '/pat2' was heard
        channel: command.channel_id,
        // The user the message should appear for
        user: command.user_id,
        text:
          "Your command was not recognized.\n Please try again using format:\n`/pat <time> , <reminder text> (@xxx)`"
      });
      console.log(result);
    } else {
      
      // Create a reminder
      const result = await client.reminders.add({
        token: process.env.USER_TOKEN,
        text: arg.substring(ind + 1),
        time: arg.substring(0, ind),
        user: user
      });
      console.log(result);

      // send sender a private confirmation message
      await client.chat.postEphemeral({
        token: context.botToken,
        // The channel where '/pat2' was heard
        channel: command.channel_id,
        // The user the message should appear for
        user: command.user_id,
        text: `Reminder successfully set for ${username} at time: ${arg.substring(
          0,
          ind
        )}`
      });
    }
  } catch (error) {
    console.error(error);

    if (error.type == "cannot_parse") {
      // send sender a private error message
      await client.chat.postEphemeral({
        token: context.botToken,
        // The channel where '/pat2' was heard
        channel: command.channel_id,
        // The user the message should appear for
        user: command.user_id,
        text: `The phrasing of the timing for this reminder is unclear. You must include a complete time description. Some examples that work: 1458678068, 20, in 5 minutes, tomorrow, at 3:30pm, on Tuesday, or next week.`
      });
    }
  }
});
















(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();



