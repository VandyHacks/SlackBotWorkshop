# Building A Slackbot
Hackpack for VandyHack's Slackbot workshop on July 11th. This bot's functionality includes creating task reminders and group polls.

## What exactly is a bot?
A **bot** is both a *system user* and an *application* operating inside an infrastructure. Bots are particularly useful for performing small, repetitive tasks in user workspaces.

A **Slackbot** is simply a type of Slack App that interacts with users via conversation. 

## What is an API?
An **Application Programming Interface (API)** is a software intermediary that allows two applications to talk to each other. An API specifies how software components should interact by providing a set of pre-implemented methods/variables/classes for building software applications. For example, the [Slack APIs](https://api.slack.com/apis) are used for Slack app development.

## Key Terms
* **Slash command:** acts as a shortcut that triggers messages or actions from Slack, an app, or an integration
* **Message payload:** a JSON object that is used to define *metadata* about the message, such as its visual composition and where it should be published
    
## Usage
This bot responds to four [slash commands](https://api.slack.com/interactivity/slash-commands): 
  * `/pat` - Creates a reminder for a channel; *usage hint:* `/pat [timeString] , [message]`
  
  * `/pat2` - Creates a reminder for a specific user; *usage hint:* `/pat2 [@user] [time] , [message]`
  
  * `/newpoll` - Creates a new poll in a channel; *usage hint:* `/newpoll [pollQuestion]? [option1] , [option2] , ...`
  
  * `/closepoll` - Closes the current poll in a channel; *usage hint:* `/closepoll`

## Bolt & Glitch
We used Bolt & Glitch to create this JavaScript-based Slackbot.
[Bolt](https://slack.dev/bolt) is the official Node.js framework for JavaScript-based Slack app development. [Glitch](https://glitch.com/) is a collaborative platform for creating, remixing and hosting web apps in real time.

## Your Project
- `app.js` contains the primary Bolt app. It imports the Bolt package (`@slack/bolt`) and starts the Bolt app's server. It's where you'll add your app's listeners.
- `.env` is where you'll put your Slack app's authorization token and signing secret.
- The `examples/` folder contains a couple of other sample apps that you can peruse to your liking. They show off a few platform features that your app may want to use.
##
### [Slackbot Workshop Slides](https://docs.google.com/presentation/d/1UbHfAJaIuckU3043tWs5wUggB5aqeHN_Yyxxk8WkUy8/edit?usp=sharing)
### Read the [Bolt documentation](https://slack.dev/bolt) & [Getting Started guide](https://api.slack.com/start/building/bolt)

\ ゜o゜)ノ
