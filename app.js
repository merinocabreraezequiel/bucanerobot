const tmi = require('tmi.js');
const client = new tmi.Client({
	options: { debug: true },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: 'bucanerobot',
		password: 'oauth:generatedCode'
	},
	channels: [ '#TwitchChannel' ]
});
client.connect();
client.on('message', (channel, tags, message, self) => {
	if(self) return;
	if(message.toLowerCase() === '!hello') {
		client.say(channel, `@${tags.username}, heya!`);
	}
	if(message.toLowerCase() === '!commandos') {
		client.say(channel, `@${tags.username} Ha solicitado los comandos!`);
	}
	console.log(tags);
});
client.on("join", (channel, username, self) => {
	if(self) return;
	client.say(channel, `@${username} Bienvenido a bordo!`);
	console.log(username + ' has joined to ' + channel);
});