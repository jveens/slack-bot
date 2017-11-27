require('dotenv').config();

const db = require('mongoose');
db.Promise = global.Promise;

db.connect(process.env.DATABASE_URI, {
	useMongoClient: true
});
db.connection.on('error', (err) => {
	console.log(`......... ${err.message}`);
});

module.exports = db;