require('dotenv').config();

let express = require('express');
let request = require('request');
let bodyParser = require('body-parser');
let passport = require('passport');
let session = require('express-session');
let SlackStrategy = require('passport-slack').Strategy;
let WebClient = require('@slack/client').WebClient;
let mongoose = require('mongoose');

let helpers = require('./helpers');
let botMessages = require('./bot-messages');
let db = require('./database');

const token = process.env.SLACK_API_TOKEN; //see section above on sensitive data
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const verificationToken = process.env.VERIFICATION_TOKEN;

// import models
require('./models/User');
const User = mongoose.model('User');

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

    let dayOfWeek = helpers.parseDayOfWeek(words);

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

        // Send a message to the team
        web.chat.postMessage(
            channel,
            message.text,
            message.data,
            function (err, res) {
                if (err) {
                    console.log('Error:', err);
                } else {
                    console.log('Message sent: ', res);

        // Send a message to the creator
                    web.chat.postMessage(
                        creator.id,
                        creatorMessage,
                        function (err, res) {
                            if (err) {
                                console.log('Error:', err);
                            } else {
                                console.log('CreatorMessage sent: ', res);
                            }
                        }
                    );
                }
            }
        );
    }

    if (action === 'join') {
        console.log(payload.user.name + " IS IN!");
        const slackId = payload.user.id;
        const name = payload.user.name;
        const team = payload.team.id;
        const channel = payload.channel.id;

        const user = new User({
            slack_id: slackId,
            name,
            team
        });

        // check for the user
        User.count({
            slack_id: slackId
        })
        .then(result => {
            if (result > 0) {
                console.log('already exists');
            } else {
                console.log('save it!');
            }
        });

        // user
        // .save()
        // .then(user => {
        //     console.log('Hi new user!' + user.name);

        //     web.chat.postMessage(
        //         channel,
        //         'Terrific, I\'ve sent you a DM. You can submit your 3 Things there.',
        //         {
        //             replace_original: true
        //         },
        //         function(err, res) {
        //             if (err) {
        //                 console.log('Error: ', err);
        //             } else {
        //                 console.log('DONNEEEEE');
        //             }
        //         }
        //     )
        // });
    }

    

});
