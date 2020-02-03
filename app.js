/** IMPORTING AND NEEDED VARS INITALIZATION*/
const tmi = require('tmi.js');
const fs = require('fs');
var TwitchAPI = require('twitch-api-v5'); 

let rawdata = fs.readFileSync('config.json');
let ConnectionData = JSON.parse(rawdata);

const ChatUser = {
	username: "",
	lastJoinDate: "",
	greetedDays: 0,
	todayGreeted: false,
	justfunctionSheet: function () {
	  console.log(`username ${this.username}. lastjoinDate ${this.lastJoinDate}`);
	}
  };
let UsersArray = [];

/** TWITCH API APP CLIEND ID DEFINITION */
TwitchAPI.clientID = ConnectionData.AppClientID;

/** TMI CREATING CONNECTION */
const client = new tmi.Client({
	options: { debug: ConnectionData.debug },
	connection: {
		reconnect: ConnectionData.reconnect,
		secure: ConnectionData.secure
	},
	identity: {
		username: ConnectionData.username,
		password: ConnectionData.oauth
	},
	channels: ConnectionData.channels
});
client.connect();

/** TWITCH API FUNCTIONS */
getChattersTwitchAPI();

setInterval(function(){
    getChattersTwitchAPI()
}, 30000)

function getChattersTwitchAPI(){
	TwitchAPI.other.chatters({ channelName: ConnectionData.channel }, (err, res) => {
    	if(err) {
   	     console.log(err);
    	} else {
    	    console.log(res);
    	}
	});
}

/** TMI ON EVENTS */
client.on('message', (channel, tags, message, self) => {
	if(self) return;
	switch(message.toLowerCase()){
		case '!hello':
			client.say(channel, `@${tags.username}, heya!`);
		break;
		case '!commandos':
			client.say(channel, `@${tags.username} Ha solicitado los comandos!`);
		break;
		default:
			console.log('no action wit this messaje');
	}
	console.log(tags);
	console.log(channel);
	let data = JSON.stringify(tags, null, 2);
	fs.appendFile('tagsLog.json', data, (err) => {
		if (err) throw err;
		console.log('Data written to file');
	});
});
client.on("join", (channel, username, self) => {
	if(self) return;
	let cu = Object.create(ChatUser);
	let registered = false;
	UsersArray.forEach(function (element, index, array) {
		if (element.username === username){
			registered=true;
			if (element.lastJoinDate !== currentDateFormated()){
				element.lastJoinDate = currentDateFormated();
				++element.greetedDays;
				element.todayGreeted = false;
			} else {
				element.todayGreeted = true;
			}
			cu = element;
		}
		console.log(index, element.username, element.greetedDays);
	});
	if (!registered){
		cu.username = username;
		cu.lastJoinDate =  currentDateFormated();
		cu.greetedDays = 1;
		cu.todayGreeted = false;
		let jsonvar = {
			username : cu.username,
			lastJoinDate : cu.lastJoinDate,
			greetedDays : 1,
			todayGreeted : false
		}	
		let data = JSON.stringify(jsonvar, null, 2);
		fs.appendFileSync('usersregistry.json', data);
		UsersArray.push(cu);
	}
	if(cu.todayGreeted){
		client.say(channel, `Bienvenido de vuelta @${username} `);
	} else {
		client.say(channel, `Bienvenido a bordo @${username}`);
	}
	console.log(username + ' has joined to ' + channel);
	//console.log(cu.username + ' ' + cu.lastJoinDate);
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