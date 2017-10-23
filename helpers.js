let WebClient = require('@slack/client').WebClient;

let request = require('request');

module.exports = {
    
    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    sendMessageToSlackResponseURL: function(responseURL, JSONmessage){
        var postOptions = {
            uri: responseURL,
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            json: JSONmessage
        };

        request(postOptions, (error, response, body) => {
            if (error){
                console.log(error);
                // handle errors as you see fit
            } else {
                console.log('message sent');
            }
        });
    },

    sendMessageToChannel: function(message, channel) {
        var postOptions = {
            url: 'https://slack.com/api/chat.postMessage',
            method: 'POST',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            body: {

            }
        };
    }
    
};