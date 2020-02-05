/* IMPORTING AND NEEDED VARS INITALIZATION*/
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

/* TWITCH API APP CLIEND ID DEFINITION */
TwitchAPI.clientID = ConnectionData.AppClientID;

/* TMI CREATING CONNECTION */
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

/* TWITCH API FUNCTIONS */
getChattersTwitchAPI();

setInterval(function(){
    getChattersTwitchAPI()
}, 30000)

/**
 * Get user JSON of users online in a channel
 * @constructor
 * @param {string} chatChannel name of the Twitch Channel
 */
function getChattersTwitchAPI(chatChannel=ConnectionData.channel){
	TwitchAPI.other.chatters({ channelName: chatChannel }, (err, res) => {
    	if(err) {
   	     console.log(err);
    	} else {
			res.chatters.viewers.forEach(function (element, index,){
				checkUserRegister(element, chatChannel);
				console.log(element+' '+chatChannel);
			});
			console.log(res);
    	}
	});
}

/* TMI ON EVENTS */
/**
 * Actions for a recived message in the chat
 * @event
 * @returns {string} channel - Name of the connected channel
 * @returns {json} tags - json with user information
 * @returns {string} message - original text sended to chat
 * @returns {object} self - it self
 */
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
/**
 * Action for join event in the chat
 * @event
 * @returns {string} channel - Name of the connected channel
 * @returns {string} username - Name of the user in chat
 * @returns {object} self - it self
 */
client.on("join", (channel, username, self) => {
	if(self) return;
	checkUserRegister(username, channel);
	//console.log(cu.username + ' ' + cu.lastJoinDate);
});

/* INTERNAL FUNCTIONS */
/**
 * Format in DD-MM-YYYY current date
 * @function
 * @returns {string} DD-MM-YYYY
 */
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
/**
 * check user name in database and to acctions like greet or add to registry
 * @function
 * @param {string} username - Name of the user in chat to check if exist or actions to do
 * @param {string} channel - Name of the channel to send the answer if its need it
 */
function checkUserRegister(username, channel){
	let cu = Object.create(ChatUser);
	let registered = false;
	UsersArray.forEach(function (element, index, array) {
		if (element.username === username){
			registered=true;
			if (element.lastJoinDate !== currentDateFormated()){
				element.lastJoinDate = currentDateFormated();
				element.greetedDays = element.greetedDays + 1;
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
}