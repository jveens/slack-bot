
let helpers = require('./helpers');

module.exports = {

    sendConfirmMessage: function(creatorName, day) {
        
        let dayOfWeek = helpers.capitalizeFirstLetter(day);
        let message_json = {};
        let actions = [];
        let launchButton = {
            name: 'create',
            type: 'button',
            value: dayOfWeek,
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
        message_json['text'] = `Do you want to share 3 Things on ${dayOfWeek} at noon.`;
        message_json['attachments'] = [
            {
                callback_id: 'train_action',
                actions: actions
            }
        ];
        
        return message_json;
    },
    
    sendMainMessage: function(creatorName, dayOfWeek) {

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
        
        message['text'] = `:balloon::balloon::balloon:\n3 Things has been commenced by <@${creatorName}>!\nWe\'ll be sharing this week\'s Things ${helpers.capitalizeFirstLetter(dayOfWeek)} at noon.`;
        message.data = {};
        message.data['response_type'] = 'in_channel';
        message.data['attachments'] = [
            {
                callback_id: 'submit_3things',
                fallback: 'Join 3 Things',
                actions: actions,
                color: 'B13F63',
            }
        ];

        message.data['attachments'] = JSON.stringify(message.data['attachments']);

        return message;
    }

};
