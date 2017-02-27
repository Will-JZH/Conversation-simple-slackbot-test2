/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('dotenv').load();

var Slack = require('slack-node');
var channelName = "congnitivetest";
var slackToken = process.env.SLACK_TOKEN;
var userName = "bot";

slack = new Slack(slackToken);

var Botkit = require('botkit');
var express = require('express');
var middleware = require('botkit-middleware-watson')({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  workspace_id: process.env.WORKSPACE_ID,
  version_date: '2016-09-20'
});

// var exec = require('child_process').exec;

var fs = require('fs');
var path = require('path');

// Configure your bot.
var slackController = Botkit.slackbot();
var slackBot = slackController.spawn({
  token: process.env.SLACK_TOKEN
});

slackController.hears(['.*'], ['direct_mention', 'direct_message', 'mention'], function(bot, message) {
  slackController.log("channel id: " + message.channel);
  if (message.text == "training") {
    slack.api(
      'channels.history', {channel:"C45NLP9K8", count:10},
      function(status,data){
        var historyMessage = eval(data);
        slackController.log("success achieve history!!!!!!!!!!")
        if (historyMessage["ok"]) {
          for (var i = 1; i < historyMessage["messages"].length; i++)
          {
            if (historyMessage["messages"][i].text.indexOf("?") > 0) {
              var commonWords = ['i','a','about','an','and','are','as','at','be','by','com','de','en','for','from','how','in','is','it','la','of','on','or','that','the','this','to','was','what\'s','what','when','where','who','will','with','und','the','www'];
              var text = historyMessage["messages"][i].text.toLowerCase();
              var text = text.substring(0, text.length - 1);
              var words = text.split(" ");
              var newWords = words.filter( function (word) {
                return commonWords.indexOf(word) === -1;
              });
              var intent = newWords.join("_");
              var text_struct = {
                "text" : historyMessage["messages"][i].text,
                "created" : "",
                "updated" : ""
              };
              var intent_struct = {
                "intent" : intent,
                "created" : "",
                "updated" : "",
                "example" : [text_struct]
              };
              var dialog_node_struct = {
                "go_to":null,
                "output":{"text":historyMessage["messages"][i-1].text},
                "parent":null,
                "context":null,
                "created":"",
                "updated":"",
                "metadata":null,
                "conditions":"#" + intent,
                "description":null,
                "dialog_node":intent,
                "previous_sibling":"turn_on_node"
              };
              slackController.log("intent: " + intent);
              slackController.log("Q: " + historyMessage["messages"][i].text);
              slackController.log("A: " + historyMessage["messages"][i - 1].text);
              slackController.log("intent_struct: " + JSON.stringify(intent_struct));
              slackController.log("dialog_node_struct: " + JSON.stringify(dialog_node_struct));
              // fs.readFile(path.join(__dirname, 'workspace-slackbot.json'), function (err,bytesRead) {
              //   if (err) throw err;
              //   slackController.log("read success!!!!!!!!!");
              //   var dataRead = JSON.parse(bytesRead);
              //   var text_struct = {
              //     "text" : historyMessage["messages"][i].text,
              //     "created" : "",
              //     "updated" : ""
              //    };
              //   var intent_struct = {
              //     "intent" : intent,
              //     "created" : "",
              //     "updated" : "",
              //     "example" : [text_struct]
              //   };
              //   var dialog_node_struct = {
              //     "go_to":null,
              //     "output":{"text":historyMessage["messages"][i-1].text},
              //     "parent":null,
              //     "context":null,
              //     "created":"",
              //     "updated":"",
              //     "metadata":null,
              //     "conditions":"#" + intent,
              //     "description":null,
              //     "dialog_node":"#" + intent,
              //     "previous_sibling":"turn_on_node"
              //   };
              //   for(var j = dataRead['intents'].length - 1; j >= 0; j--) {
              //     if (dataRead['intents'][j]['intent'] == intent) {
              //       for (var k = dataRead["dialog_nodes"].length - 1; k >= 0; k--) {
              //         if (dataRead["dialog_nodes"][k]['dialog_node'] == "#" + intent) {
              //           dataRead["dialog_nodes"][k]["output"] = dataRead["dialog_nodes"][k]["output"] + historyMessage["messages"][k - 1].text;
              //           break;
              //         }  
              //         else if (k == 0) {
              //           dataRead["dialog_nodes"].push(dialog_node_struct);
              //         }
              //       };
              //       break;
              //     } else if (j == 0) {
              //       dataRead['intents'].push(intent_struct);
              //     };
              //   }

              //   fs.writeFile(path.join(__dirname, 'workspace-slackbot.json'), JSON.stringify(dataRead), function (err) {
              //     if (err) throw err;
              //     slackController.log("Export Account Success!");
              //     slackController.log("The address: " + __dirname);
              //   });
              // });
              break;
            }
            
          }
        };
      }
    );
  }

  //judge whether is a question
  // if (message.text.indexOf("?") > 0) {
  //   var text = message.text.toLowerCase();
  //   text = text.substring(0, text.length - 1);
  //   var words = text.split(" ");
  //   var newWords = words.filter( function (word) {
  //     return commonWords.indexOf(word) === -1;
  //   });
  //   slackController.log(newWords);
  //   var intent = newWords.join("_");

    // arg = "\"when will the meeting start?\""
    // exec("python extractKeywords.py " + "\"" + arg + "\"", function ( err, stdout, stderr ){
    //   if (stdout.length > 0) {
    //     intent = stdout;
    //   };
    // })
    
  

  middleware.interpret(bot, message, function(err) {
    if (!err) {
      // if (message.event == "direct_mention") {
        if (message.text == "training") {
          slack.api(
            'chat.postMessage', {text:"I am trainging......", channel:'#testslackapi',username:userName},
            function(){}
          );
        } else {
          slack.api(            
            'chat.postMessage', {text:message.watsonData.output.text.join('\n'), channel:'#testslackapi',username:userName},
            function(){}
          );
        };
        // bot.reply(message, message.watsonData.output.text.join('\n'));
        // slack.api(
        //   'chat.postMessage', {text:message.watsonData.output.text.join('\n'), channel:'#'+channelName,username:userName},
        //   function(){}
        // );
      // }
    }
  });
});

// // query chat history, C367P1UH3 is the id of #congnitivetest.
// slack.api(
//   'channels.history', {channel:"C367P1UH3"},
//   function(status,data){
//     console.log(JSON.stringify(data));
//   }
// );

// //don't use @
// slackController.on('message_received', function(bot, message) {
//   slackController.log('Slack message received');
//   slackController.log("=========================");
//   slackController.log(JSON.stringify(message));
//   slackController.log("=========================");
//   middleware.interpret(bot, message, function(err) {
//     if(!err){
//       slack.api(
//         'chat.postMessage',{text:message.watsonData.output.text.join('\n'), channel:'#'+channelName, username:userName},
//         function(){}
//       );
//     }
//   });
// });

slackBot.startRTM();

// Create an Express app
var app = express();
var port = process.env.PORT || 5000;
app.set('port', port);
app.listen(port, function() {
  console.log('Client server listening on port ' + port);
});
