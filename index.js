require('dotenv').config();

let express = require('express');
let request = require('request');
let bodyParser = require('body-parser');
let passport = require('passport');
let session = require('express-session');
let SlackStrategy = require('passport-slack').Strategy;
let WebClient = require('@slack/client').WebClient;

let helpers = require('./helpers');
let botMessages = require('./bot-messages');

var token = process.env.SLACK_API_TOKEN; //see section above on sensitive data
var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
var verificationToken = process.env.VERIFICATION_TOKEN;


let web = new WebClient(token);

const PORT = 4390;

var app = express();

app.set('view engine', 'pug');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new SlackStrategy({
    clientID: clientId,
    clientSecret: clientSecret,
    skipUserProfile: true,
    scope: [ 'users.read', 'users.profile:read']
  }, (accessToken, refreshToken, profile, done) => {

    return done(null, {
        profile : profile,
        token: accessToken,
        refreshToken: refreshToken
    });
  }
));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// the port we are running our local app on (from ngrok)
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.get('/', (req, res) => res.render('index'));

app.get('/auth/slack', passport.authenticate('slack'));

app.get('/welcome', checkAuth, (req, res) => res.json(req.user));

app.get('/auth/slack/callback', passport.authenticate('slack', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/welcome')
});


function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        console.log('NEXT');
        return next();
    } else {
        console.log('GO HOME');
        res.redirect('/');
    }
}

function parseDayOfWeek(words) {

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
}

function parseTime(words) {

    let time;

    words.some(word => {
        var date = new Date('');
        console.log(date);
    });
}

app.post('/commands/things', function(req, res){
    let command = req.body;
    let thingsText = command.text;
    let channelId = command.channel_id;
    let channelName = command.channel_name;
    let creatorId = command.user_id;
    let creatorName = command.user_name;

    // console.log(command);

    let lowercaseString = thingsText.toLowerCase();
    let words = lowercaseString.split(' ');
    
    let confirmDay;
    let confirmTime;

    if (thingsText == 'help') {
        res.send('Typing `/3things [optional day of the week] [at optional time]` will start 3 Things for your team!');
    }

    let dayOfWeek = parseDayOfWeek(words);

    if (typeof dayOfWeek === 'undefined') {
        confirmDay = true;
        dayOfWeek = 'friday';
    } else {
        // remove the day of the week from the array 
        let index = words.indexOf(dayOfWeek);
        words.splice(index, 1)
    }

    // Save 3 things to DB

    // Send message with 3 Things link to all channel participants

    // sendMainMessage(creator, dayOfWeek)
    const message = botMessages.confirmMessage(creatorName, dayOfWeek);

    res.send(message);

});

app.post('/buttons', function(req, res){

    // respond immediately with a 200 so we don't timeout
    res.status(200).end();

    let payload = JSON.parse(req.body.payload);
    let responseUrl = payload.response_url;
    let callbackId = payload.callback_id;
    let action = payload.actions[0].name;
    let channel = payload.channel.id;
    let creator = payload.user;
    let dayOfWeek = helpers.capitalizeFirstLetter(payload.actions[0].value);
    let creatorMessage;
    let message;

    console.log(payload);

    if (action === 'create') {
        // Store in DB
        // Send message to channel
        message =  botMessages.mainMessage(creator.name, dayOfWeek);
        creatorMessage = botMessages.creatorMessage(dayOfWeek);
        console.log(message);
    }

    web.chat.postMessage(channel, 
        message.text, 
        message.data, 
        function(err, res) {
            if (err) {
                console.log('Error:', err);
            } else {
                console.log('Message sent: ', res);

                web.chat.postMessage(
                    creator.id,
                    creatorMessage,
                    function(err, res) {
                        if (err) {
                            console.log('Error:', err);
                        } else {
                            console.log('CreatorMessage sent: ', res);
                        }
                    })
            }
    });

});
