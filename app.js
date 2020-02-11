/* IMPORTING AND NEEDED VARS INITALIZATION*/
const tmi = require('tmi.js');
const fs = require('fs');
//const StreamlabsApi = require('streamlabs');
var TwitchAPI = require('twitch-api-v5');
const activeWin = require('active-win');
const SockJS = require('sockjs-client'); 

let ConfigData = JSON.parse(fs.readFileSync('config.json'));
const slScenes = JSON.parse(fs.readFileSync('streamlabsScenes.json'));

const sock = new SockJS('http://127.0.0.1:59650/api');
const pendingTransactions = [];

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

let currWindow;

/* TWITCH API APP CLIEND ID DEFINITION */
TwitchAPI.clientID = ConfigData.TwitchAPI.AppClientID;

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
    getChattersTwitchAPI()
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
					console.log(element+' ya en la lista');
				}
				GreetListTemp.push(element);
				console.log(element+' '+chatChannel);
			});
			res.chatters.vips.forEach(function (element, index,){
				if (!GreetList.includes(element)){
					GreetList.push(element);
					checkUserRegister(element, chatChannel);
				} else {
					console.log(element+' ya en la lista');
				}
				GreetListTemp.push(element);
				console.log(element+' '+chatChannel);
			});
			res.chatters.moderators.forEach(function (element, index,){
				if (!GreetList.includes(element)){
					GreetList.push(element);
					checkUserRegister(element, chatChannel);
				} else {
					console.log(element+' ya en la lista');
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

/* SOCKET EVENTS AND ACCTIONS */
sock.onopen = () => {
	console.log('===> Connected Successfully to Streamlabs');
	sock.send(
		JSON.stringify({
			"jsonrpc": "2.0",
			"id": 14,
			"method": "setVisibility",
			"params": {
				"resource": "SceneItem[\"f3f9e305-bbc3-49da-a3b5-4da53a9641df\",\"f99e7692-a597-4f65-a491-c69b0136b780\",\"image_source_9921c812-c93f-40e5-bde5-8f23dea1cd4b\"]",
				"args": [
					true
				]
			}
		})
	);
};
sock.onmessage = e => {
    // Remove pending transaction.
    if (pendingTransactions.length <= 0) return;
    var transactionType = pendingTransactions.shift();

    // Parse JSON Data
	var response = JSON.parse(e.data);
	console.log('transactionType.sceneName: '+transactionType.sceneName);
	console.log('sock: '+response.result[0].activeScene);
	console.log('transactionType.type: '+ transactionType.type);
    if (transactionType.type === 'sceneRequest') {
        if (response.result[0].name === undefined) {
            console.log('Was unable to parse a result.');
            return;
        }

//		var foundScene = response.result.find(x => x.name === transactionType.sceneName);
		console.log('transactionType.sceneName: '+ transactionType.sceneName)

        if (foundScene === undefined) return;

 //       console.log(`Transition to Scene: ${transactionType.sceneName}`);
 /*       sock.send(
            JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'makeSceneActive',
                params: {
                    resource: 'ScenesService',
                    args: [foundScene.id]
                }
            })
        );*/
        return;
    }
};

function sendSceneRequest(nameOfScene) {
    pendingTransactions.push({ type: 'sceneRequest', sceneName: nameOfScene });
    sock.send(
        JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getScenes',
            params: {
                resource: 'ScenesService'
            }
        })
    );
}

setInterval(async () => {
    const res = await activeWin();

    var windowFoundExe = slScenes.data.find(x => {
        if (res && res.owner.name.toLowerCase().includes(x.windowIncludes.toLowerCase())) return x;
    });

    var windowFound = slScenes.data.find(x => {
        if (res && res.title.toLowerCase().includes(x.windowIncludes.toLowerCase())) return x;
    });

    if (windowFound === undefined && windowFoundExe === undefined) return;

    if (currWindow === res.id) return;

    currWindow = res.id;

    if (windowFound !== undefined) {
        sendSceneRequest(windowFound.sceneSelect);
    }

    if (windowFoundExe !== undefined) {
        sendSceneRequest(windowFoundExe.sceneSelect);
    }
}, 500);


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
	if (!cu.todayGreeted){
		if (cu.greetedDays <= ConfigData.Greet.daysBeforeIgnore){
			client.say(channel, `Bienvenido a bordo @${username}`);
		} else {
			client.say(channel, `@${username} ya te has pasado por aquí 5 días, date por saludado para siempre`);
		}
	} else {
		client.say(channel, `Bienvenido de vuelta @${username} `);
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