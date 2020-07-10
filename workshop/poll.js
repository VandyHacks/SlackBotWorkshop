// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

var pollTitle; // poll title to populate visual components
var timestamp; // var to store timestamp of original bot message to be updated
var channel; // channel id
var options = []; // the array of options in poll
var optionviews = []; // array of views for the options
var dicSelection = {}; // library of user selections formatted [(user id) : (user selection)]
var isOpen = false; // boolean to track the current state of a poll (i.e. open, closed)

// Listen for a '/newpoll' slash command invocation
// command format '/newpoll [poll question]? [option 1] , [option 2] , ...'
app.command("/newpoll", async ({ ack, command, payload, context }) => {
  // Acknowledge the command request
  ack();

  try {
    dicSelection = {}; // clear array when new poll started
    isOpen = true; // set to true when new poll started

    let pollInfo = command.text;
    pollTitle = pollInfo.substring(0, pollInfo.indexOf("?") + 1).trim();

    // load options array with user-provided options
    options = pollInfo.substring(pollInfo.indexOf("?") + 1);
    options = options.replace(/(^\s*,)|(,\s*$)/g, "").split(","); //remove leading & trailing white space or comma

    // load optionviews array with option objects
    for (var i = 0; i < options.length; i++) {
      options[i] = options[i].trim();

      // create option object from option string
      let optionview = {
        
        // PASTE OPTION OBJECT CODE HERE
        
      };
      // optionviews[i] = optionview;
    }

    // Call the chat.postMessage method using the built-in WebClient
    const result = await app.client.chat.postMessage({
      // The token you used to initialize your app is stored in the `context` object
      token: context.botToken,
      // Payload message should be posted in the channel where original message was heard
      channel: command.channel_id,

      // INSERT MESSAGE BLOCKS HERE!!!
      // https://app.slack.com/block-kit-builder

    });

    console.log(result);
    timestamp = result.ts;
  } catch (error) {
    console.error(error);
  }
});

// function to generate the modal according to pollTitle
// Let's use block kit for this
//https://app.slack.com/block-kit-builder/T0BQKS37X#%7B%22type%22:%22modal%22,%22callback_id%22:%22option_submit%22,%22title%22:%7B%22type%22:%22plain_text%22,%22text%22:%22New%20Option%22,%22emoji%22:true%7D,%22submit%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Submit%22,%22emoji%22:true%7D,%22close%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Cancel%22,%22emoji%22:true%7D,%22blocks%22:%5B%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22*my%20Poll*%22%7D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22input%22,%22element%22:%7B%22type%22:%22plain_text_input%22,%22action_id%22:%22added%22%7D,%22label%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Enter%20your%20new%20option%20below:%22,%22emoji%22:true%7D,%22block_id%22:%22new_option%22%7D%5D%7D

function addoptionview(pollTitle) {
  let view = {
    //INSERT THE MODAL VIEW HERE!!
  };
  return view;
}
//block_id, and action_id

// Listen for a button invocation with action_id `add_option`
app.action("add_option", async ({ ack, context, payload, action, body }) => {
  // Acknowledge the button request
  ack();

  try {
    // Open up a view modal to let user enter an option
    const result = await app.client.views.open({
      token: context.botToken,
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View modal dialog, defined above
      view: addoptionview(action.block_id)
    });
    channel = body.channel.id; //store the channel id for option submit
  } catch (error) {
    console.error(error);
    console.error(error.data.response_metadata.messages);
  }
});

// Listen for modal submission with callback_id 'option_submit'
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
    // get value of selected option object
    let selectedVal = payload.selected_option.value;
    
    // change this user's selection to their most recent selection
    dicSelection[body.user.id] = selectedVal;
  } catch (error) {
    console.error(error);
  }
});

// Listen for a '/closepoll' slash command invocation
app.command("/closepoll", async ({ ack, command, payload, context }) => {
  // Acknowledge the command request
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
