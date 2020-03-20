/* IMPORTING AND NEEDED VARS INITALIZATION*/
const tmi = require('tmi.js');
const fs = require('fs');
//const StreamlabsApi = require('streamlabs');
var TwitchAPI = require('twitch-api-v5');

const Slobs = require('./slobs')

let ConfigData = JSON.parse(fs.readFileSync('config.json'));

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
let GreetList = [];

let UAObj = JSON.parse(fs.readFileSync('usersregistry.json'));
UAObj.forEach(function (element, index,){
	UsersArray.push(element);
	console.log('Add to UsersArray: '+element.username);
});

let slob = new Slobs(ConfigData.Slob.url, ConfigData.Slob.commandosSource);

const enable_functions = {
	greet: ConfigData.Modules.greet,
	commandos: ConfigData.Modules.slobs
}

/* TWITCH API APP CLIEND ID DEFINITION */
TwitchAPI.clientID = ConfigData.TwitchAPI.appClientID;

/* TMI CREATING CONNECTION */
const client = new tmi.Client({
	options: { debug: ConfigData.TMI.debug },
	connection: {
		reconnect: ConfigData.TMI.reconnect,
		secure: ConfigData.TMI.secure
	},
	identity: {
		username: ConfigData.TMI.username,
		password: ConfigData.TMI.oauth
	},
	channels: ConfigData.TMI.channels
});
client.connect();


/* TWITCH API FUNCTIONS */
getChattersTwitchAPI();

setInterval(function(){
	getChattersTwitchAPI();
	slob.getCurrentSceneID();
}, 30000)

/**
 * Get user JSON of users online in a channel
 * @constructor
 * @param {string} chatChannel name of the Twitch Channel
 */
function getChattersTwitchAPI(chatChannel=ConfigData.TwitchAPI.channel){
	TwitchAPI.other.chatters({ channelName: chatChannel }, (err, res) => {
    	if(err) {
   	     console.log(err);
    	} else {
			let GreetListTemp = [];
			res.chatters.viewers.forEach(function (element, index,){
				if (!GreetList.includes(element)){
					GreetList.push(element);
					checkUserRegister(element, chatChannel);
				} else {
					console.log(element+' already on the list');
				}
				GreetListTemp.push(element);
				console.log(element+' '+chatChannel);
			});
			res.chatters.vips.forEach(function (element, index,){
				if (!GreetList.includes(element)){
					GreetList.push(element);
					checkUserRegister(element, chatChannel);
				} else {
					console.log(element+' already on the list');
				}
				GreetListTemp.push(element);
				console.log(element+' '+chatChannel);
			});
			res.chatters.moderators.forEach(function (element, index,){
				if (!GreetList.includes(element)){
					GreetList.push(element);
					checkUserRegister(element, chatChannel);
				} else {
					console.log(element+' already on the list');
				}
				GreetListTemp.push(element);
				console.log(element+' '+chatChannel);
			});
			GreetList = GreetListTemp;
			console.log(GreetList);
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
			if (enable_functions.commandos){
				client.say(channel, `@${tags.username} Ha solicitado los comandos!`);
				slob.showCommandos(true);
				setTimeout(function () {slob.showCommandos(false);}, ConfigData.Slob.showingTime);
			} else {
				client.say(channel, `Lo siento @${tags.username} no me dejan mostrarte el listado`);
			}
		break;
		default:
			console.log('no action with this messaje');
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
 * @param {string} channel - Name of the connected channel
 * @param {string} username - Name of the user in chat
 * @param {object} self - it self
 */
client.on("join", (channel, username, self) => {
	if(self) return;
	//checkUserRegister(username, channel);
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
		UsersArray.push(cu);
	}
	if (enable_functions.greet){
		if (!cu.todayGreeted){
			if (cu.greetedDays <= ConfigData.Greet.daysBeforeIgnore){
				client.say(channel, `Bienvenido a bordo @${username}`);
			} else {
				client.say(channel, `@${username} ya te has pasado por aquí ${ConfigData.Greet.daysBeforeIgnore} días, date por saludado para siempre`);
			}
		} else {
			client.say(channel, `Bienvenido de vuelta @${username} `);
		}
	}
	updateUsersJson();
	console.log(username + ' has joined to ' + channel);
}

/**
 * Save Array to json file with users statistics
 * @function
 */
function updateUsersJson(){
	let data = JSON.stringify(UsersArray, null, 2);
	fs.writeFileSync('usersregistry.json', data);
}
