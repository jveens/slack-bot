let WebClient = require('@slack/client').WebClient;

let request = require('request');

module.exports = {
    
    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },


    parseDayOfWeek: function(words) {

        let days = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ];

        let day;

        words.some(word => {
            if (days.includes(word)) {
                day = word;
            }
        });

        return day;
    },

    parseTime: function(words) {

        let time;

        words.some(word => {
            var date = new Date('');
            console.log(date);
        });
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