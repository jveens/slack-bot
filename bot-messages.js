
let helpers = require('./helpers');

module.exports = {

    confirmMessage: function(creatorName, formUrl) {

        console.log(formUrl);
        
        // let dayOfWeek = helpers.capitalizeFirstLetter(day);
        let message_json = {};
        let actions = [];
        let launchButton = {
            name: 'create',
            type: 'button',
            value: formUrl,
            text: 'Yes, launch 3 Things!',
            style: 'primary'
        };
        let cancelButton = {
            name: 'undo',
            type: 'button',
            value: 'nothings',
            text: 'Cancel',
            style: 'secondary'
        }

        actions.push(launchButton);
        actions.push(cancelButton);

        message_json['replace_original'] = true;
        message_json['text'] = `Do you want to share 3 Things on Friday at noon.`;
        message_json['attachments'] = [
            {
                callback_id: 'train_action',
                actions: actions
            }
        ];
        
        return message_json;
    },
    
    mainMessage: function(creatorName, formUrl) {

        let message = {};
        let actions = [];
        let joinButton = {
            name: 'join',
            type: 'button',
            value: 'things',
            text: 'Submit my 3 Things',
            style: 'default'
        };

        actions.push(joinButton);
        
        message['text'] = `3 Things has been commenced by <@${creatorName}>!\n:balloon::balloon::balloon:\nSubmissions are open: ${formUrl}`;
        message.data = {};
        message.data['response_type'] = 'in_channel';

        // message.data['attachments'] = [
        //     {
        //         text: `:balloon::balloon::balloon:\nWe\'ll be sharing this week\'s Things ${dayOfWeek} at noon.`,
        //         callback_id: 'submit_3things',
        //         fallback: 'Join 3 Things',
        //         actions: actions,
        //         color: 'B13F63',
        //     }
        // ];

        // message.data['attachments'] = JSON.stringify(message.data['attachments']);

        return message;
    },

    creatorMessage: function() {

        let message = {};
        let actions = [];
        let reminderButton = {
            name: 'reminder',
            type: 'button',
            value: 'reminder',
            text: 'Send a reminder!',
            style: 'default'
        };

        actions.push(reminderButton);

        message['text'] = `You've started 3Things! We'll be sharing Friday at *noon*`;
        message.data = {};

        message.data['attachments'] = [
            {
                text: `:balloon::balloon::balloon:`,
                callback_id: 'reminder_3things',
                fallback: 'Send a reminder',
                actions: actions,
                color: 'B13F63',
            }
        ];

        message.data['attachments'] = JSON.stringify(message.data['attachments']);

        return message;

    },

    reminderMessage: function(formUrl) {
        let message = `:balloon::balloon::balloon: \n We'll be sharing 3Things at *noon* on Friday. \n Submissions are open here: ${formUrl}`;

        return message;
    }

};
