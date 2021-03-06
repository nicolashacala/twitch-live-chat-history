"use strict";
const chalk = require('chalk');
const tmi = require('tmi.js');
const Datastore = require('nedb'); 

// add some security in case of there is no twitch channels as argument
if (!process.argv[2]) {
	console.error(chalk.redBright("You need to add a Twitch channel name as first argument."));
	console.info(chalk.yellowBright("eg: npm start TWITCH_CHANNEL_NAME_1 TWITCH_CHANNEL_NAME_2"));
	console.info(chalk.yellowBright("\n->  Check README.md for more informations!"));
	process.exit(0);
}

// get twitch channels from arguments
const twitchChannels = process.argv.slice(2); 

// load databases
const database = new Datastore('chats.db'); 
const dropsDb = new Datastore('drops.db');
database.loadDatabase();
dropsDb.loadDatabase(); 

// instanciate client to listen twitch channel
const client = new tmi.Client({
	connection: {
		secure: true,
		reconnect: true
	},
	channels: twitchChannels
});

// connect client
client.connect();

console.info(chalk.greenBright("App start successfully, you will see twitch chats soon..."));

// listen messages from twitch channels
client.on('message', (channel, tags, message, self) => {
	// "#twitchChannel | Alca: Hello, World!"

	console.log(chalk.cyanBright(`${channel} | ${tags['display-name']}: ${message}`));

	// database.insert({socket_id: socket.id, time: socket.handshake.time}); 
	database.insert({
		channel,
		message,
		username: tags['display-name']
	}); 

	if (message === '!drop me') {
		console.log(`${tags['display-name']} just dropped!`); 
		dropsDb.insert({
			channel,
			username: tags['display-name']
		}); 
	}
});