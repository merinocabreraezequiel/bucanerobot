const SockJS = require('sockjs-client'); 
class slobs {
    constructor(slobsAPIURL, workingSource){
        this.workingSource = workingSource;
        this.sock = new SockJS(slobsAPIURL);
        this.commandSource = "";
        console.log('slobs - constructor');
        
        this.socketReady();
    }

    socketReady(){
        this.sock.onopen = () => {
            console.log('===> Connected Successfully to Streamlabs');
            this.getCurrentSceneID();
        }
    }

    getCurrentSceneID(){
        this.sock.send(
            JSON.stringify({
               "jsonrpc": "2.0",
               "id": 1,
               "method": "activeSceneId",
               "params": {
                   "resource": "ScenesService",
                   "args": []
                }
            })      
        );

        this.sock.onmessage = e => {
            var response = JSON.parse(e.data, undefined, 2);
            this.CurrentSceneID = response.result;
            console.log(`slobs - constructor - response: ${response.result}`);
            this.getCurrentSourceID(this.CurrentSceneID);
        }
    }

    getCurrentSourceID(sceneID){
        console.log('slobs - getCurentsourceID');
        this.sock.send(
            JSON.stringify({
                "jsonrpc": "2.0",
                "id": 2,
                "method": "getItems",
                "params": {
                    "resource": "Scene[\""+sceneID+"\"]",
                    "args": []
                }
            })      
        );

        this.sock.onmessage = e => {
            var response = JSON.parse(e.data, undefined, 2);
            var sourceData = response.result.find(x => x.name === this.workingSource);
            this.CurrentSourceID = sourceData.resourceId;
            console.log(`slobs - getCurrentSourceID - resourceID: ${sourceData.resourceId} with name: ${sourceData.name}`);
        }
    }


    showCommandos(toggle){
        console.log(`slobs - showCommandos - toggle ${toggle}`);
        this.sock.send(
            JSON.stringify({
               "jsonrpc": "2.0",
               "id": 3,
               "method": "setVisibility",
               "params": {
                   "resource": this.CurrentSourceID,
                   "args": [
                        toggle
                    ]
                }
            })
        );
        this.sock.onmessage = e => {
            var response = JSON.parse(e.data);
            console.log('slobs - onmessage:'+response.result);
        };
    };

    sendSceneRequest(nameOfScene) {
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
    };
}
module.exports = slobs;