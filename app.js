const tmi = require('tmi.js');
const ConnectionData = {
	debug:true,
	reconnect:true,
	secure:true,
	username:'bucanerobot',
	oauth:'oauth:1q3yxwbujlmndf0e108yoqivdfmxef',
	channels: [ '#ferreiraTV' ]
};
const ChatUser = {
	username: "",
	lastJoinDate: "",
	greetedTimes: 0,
	printIntroduction: function () {
	  console.log(`My name is ${this.name}. Am I human? ${this.isHuman}`);
	}
  };
let UserArray = [];
const client = new tmi.Client({
	options: { debug: ConnectionData.debug },
	connection: {
		reconnect: ConnectionData.reconnect,
		secure: ConnectionData.secure
	},
	identity: {
		username:ConnectionData.username,
		password:ConnectionData.oauth
	},
	channels:ConnectionData.channels
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
	let cu = Object.create(ChatUser);
	cu.username = username;
	cu.lastJoinDate =  currentDateFormated();
	cu.greetedTimes = cu.greetedTimes + 1;
	UserArray.push(cu);
	client.say(channel, `@${username} Bienvenido a bordo!`);
	console.log(username + ' has joined to ' + channel);
	console.log(UserArray[0].username + ' ' + UserArray[0].lastJoinDate);
});

/* INTERNAL FUNCTIONS */
function currentDateFormated() {
	var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}