// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command("/pat", async ({ command, ack, client, context }) => {
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
      const result = await client.chat.postEphemeral({
        token: context.botToken,
        attachments: [
          {
            text:
              "Some examples that work for the time field includes: `1458678068`, `20`, `in 5 minutes`, `tomorrow`, `at 3:30pm`, `on Tuesday`, or `next week`."
          }
        ],
        channel: command.channel_id,
        text:
          "Your command was not recognized.\n Please try again using format:\n`/pat <time> , <reminder text> (@xxx)`",
        user: command.user_id
      });
      console.log(result);

    } else {
      const result = await client.reminders.add({
        token: process.env.USER_TOKEN,
        text: arg.substring(ind + 1),
        time: arg.substring(0, ind),
        user: user
      });
      console.log(result);
      
      await client.chat.postEphemeral({
        token: context.botToken,
        attachments: [{}],
        channel: command.channel_id,
        text: `Reminder successfully set for ${username} at time: ${arg.substring(
          0,
          ind
        )}`,
        user: command.user_id
      });
    }
  } catch (error) {
    console.error(error);

    if (error.type == "cannot_parse") {
      await client.chat.postEphemeral({
        token: context.botToken,
        attachments: [{}],
        channel: command.channel_id,
        text: `The phrasing of the timing for this reminder is unclear. You must include a complete time description. Some examples that work: 1458678068, 20, in 5 minutes, tomorrow, at 3:30pm, on Tuesday, or next week.`,
        user: command.user_id
      });
    }
  }
});

app.command("/pat2", async ({ command, ack, say, client, context }) => {
  // Acknowledge incoming command event
  ack();
  //expect format "1 9 0 0 message"
  try {
    let commands = command.text.trim().split(" ");
    let time = new Date();
    console.log(commands);
    if (commands[0].toLowerCase() == "tomorrow") {
      time.setDate(time.getDate() + 1);
    }

    time.setDate(time.getDate() + parseInt(commands[0]));

    time.setHours(
      parseInt(commands[1]) + 5,
      parseInt(commands[2]),
      parseInt(commands[3])
    );

    // Call the chat.scheduleMessage method using the built-in WebClient
    const result = await client.chat.scheduleMessage({
      // The token you used to initalize the app
      token: context.botToken,
      channel: command.channel_id,
      text: commands.slice(4).join(" "),
      // Time to post message, in Unix Epoch timestamp format
      post_at: time.getTime() / 1000
    });
    // await say(`pat pat, your reminder is set at ${time.toString()}`);
    console.log(`pat pat, your reminder is set at ${time.toString()}`);
    // Print result
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
