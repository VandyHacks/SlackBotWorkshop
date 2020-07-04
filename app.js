// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


// ********** Project 1: Reminder Bot **********

// Listen for a '/pat' slash command invocation
// It will post a scheduled message in the channel you called the slash command
app.command("/pat", async ({ command, ack, client, context }) => {
  // Acknowledge incoming command event
  ack();

  // expect format "01 Jan 1970 00:00:00 GMT , message"
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

// Listen for a '/pat2' slash command invocation
// It will set up a reminder through default Slackbot
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


// ********** Project 2: Voting Bot **********

var pollTitle; // poll title to populate visual components
var timestamp; // var to store timestamp of original bot message to be updated
var channel; // channel id
var options = []; // the array of options in poll
var optionviews = []; // array of views for the options
var dicSelection = {}; // library of user selections formatted [(user id) : (user selection)]
var isOpen = false; // boolean to track the current state of a poll (i.e. open, closed)

// Listen for a slash command invocation
app.command("/newpoll", async ({ ack, command, payload, context }) => {
  // Acknowledge the command request
  ack();

  try {
    dicSelection = {}; // clear array when new poll started
    isOpen = true; // set to true when new poll started

    let pollInfo = command.text;
    pollTitle = pollInfo.substring(0, pollInfo.indexOf("?") + 1).trim();

    // load array with user-provided options
    options = pollInfo.substring(pollInfo.indexOf("?") + 1);
    options = options.replace(/(^\s*,)|(,\s*$)/g, "").split(","); //remove leading & trailing white space or comma

    // load optionviews array with option objects
    for (var i = 0; i < options.length; i++) {
      options[i] = options[i].trim();

      // create option object from poll option
      let optionview = {
        text: {
          type: "plain_text",
          text: options[i],
          emoji: true
        },
        value: "option_" + (i + 1)  // value of option object
      };
      optionviews[i] = optionview;
    }

    // Call the chat.postMessage method using the built-in WebClient
    const result = await app.client.chat.postMessage({
      // The token you used to initialize your app is stored in the `context` object
      token: context.botToken,
      // Payload message should be posted in the channel where original message was heard
      channel: command.channel_id,

      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Current Poll: *" + pollTitle + "*"
          },
          accessory: {
            type: "static_select",
            action_id: "selected",
            placeholder: {
              type: "plain_text",
              text: "Select an item",
              emoji: true
            },
            options: optionviews
          }
        },
        {
          type: "divider"
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Add option",
                emoji: true
              },
              action_id: "add_option"
            }
          ],
          block_id: pollTitle
        }
      ]
    });

    console.log(result);
    timestamp = result.ts;
  } catch (error) {
    console.error(error);
  }
});

// function to generate the model according to pollTitle
function addoptionview(pollTitle) {
  let view = {
    type: "modal",
    // the action to trigger when they submit
    callback_id: "option_submit",
    title: {
      type: "plain_text",
      text: "New Option",
      emoji: true
    },
    submit: {
      type: "plain_text",
      text: "Submit",
      emoji: true
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*" + pollTitle + "*"
        }
      },
      {
        type: "divider"
      },
      {
        type: "input",
        element: {
          type: "plain_text_input",
          action_id: "added"
        },
        label: {
          type: "plain_text",
          text: "Enter your new option below:",
          emoji: true
        },
        block_id: "new_option"
      }
    ]
  };
  return view;
}

// Acknowledge the button request
app.action("add_option", async ({ ack, context, payload, action, body }) => {
  ack();
  try {
    // Open up a view model to let user enter an option
    const result = await app.client.views.open({
      token: context.botToken,
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload, defined above for modulization
      view: addoptionview(action.block_id)
    });
    channel = body.channel.id; //store the channel id for option submit
  } catch (error) {
    console.error(error);
    console.error(error.data.response_metadata.messages);
  }
});

app.view("option_submit", ({ ack, body, view, context }) => {
  // Acknowledge the view_submission event
  ack();

  // Find the user input with `new_option` as the block_id and `added` as the action_id
  const newOption = view["state"]["values"]["new_option"]["added"].value.trim();
  const user = body["user"]["id"];
  // add this new option to our list of options
  options.push(newOption);
  // create a new option item for this new option
  let optionview = {
    text: {
      type: "plain_text",
      text: newOption,
      emoji: true
    },
    value: "option_" + options.length
  };
  // append it to our optionviews
  optionviews.push(optionview);

  const result = app.client.chat.update({
    token: context.botToken,
    // ts of message to update
    ts: timestamp,
    // Channel of message
    channel: channel,
    // The message block
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Current Poll: *" + pollTitle + "*"
        },
        accessory: {
          type: "static_select",
          action_id: "selected",
          placeholder: {
            type: "plain_text",
            text: "Select an item",
            emoji: true
          },
          options: optionviews
        }
      },
      {
        type: "divider"
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Add option",
              emoji: true
            },
            action_id: "add_option"
          }
        ],
        // pass the pollTitle in as the block_id so that we can have it in addoptionview
        block_id: pollTitle
      }
    ]
  });
  console.log(user + " added a new option: " + newOption);
});

// Listen for a static select menu invocation with action_id `selected`
app.action("selected", async ({ ack, payload, context, body }) => {
  // Acknowledge the static select menu request
  ack();

  try {
    let selectedVal = payload.selected_option.value;
    // change this user's selection to their most recent selection
    dicSelection[body.user.id] = selectedVal;
  } catch (error) {
    console.error(error);
  }
});

// Listen for a slash command invocation
app.command("/closepoll", async ({ ack, command, payload, context }) => {
  ack();

  try {
    if (isOpen == true) {
      let dicResult = {};
      // loop through the options and initialize count to 0
      for (var i = 1; i <= options.length; i++) {
        let optionStr = "option_" + i;
        dicResult[optionStr] = 0;
      }
      // record all the votes in dicResult
      for (var user in dicSelection) {
        dicResult[dicSelection[user]] += 1;
      }

      let formattedResults =
        "Current Poll: *" + pollTitle + "*\n\n\n_Results:_\n";

      // print poll results
      for (var i = 1; i <= options.length; i++) {
        let optionStr = "option_" + i;
        formattedResults +=
          "\t" + options[i - 1] + ": " + dicResult[optionStr] + "\n";
      }

      // Update the original message posted by the bot
      const result = await app.client.chat.update({
        token: context.botToken,
        // ts of message to update
        ts: timestamp,
        // Channel of message
        channel: command.channel_id,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: formattedResults
            }
          }
        ],
        text: "Message from Test App"
      });
      isOpen = false;
      console.log(result);
    }
  } catch (error) {
    console.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
