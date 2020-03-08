const SockJS = require('sockjs-client'); 
/**
 * Class for control the Streamlabs OBS scenes in local mode
 * @class
 * 
 */
class slobs {
    /**
     * @constructor
     * @param {string} slobsAPIURL - default 'http://127.0.0.1:59650/api'
     * @param {string} workingSource - name of the controled item on the scene
     */
    constructor(slobsAPIURL, workingSource){
        this.workingSource = workingSource;
        this.sock = new SockJS(slobsAPIURL);
        this.commandSource = "";
        console.log('slobs - constructor');
        
        this.socketReady();
    }
/**
 * start the getting info when the socket its ok
 * @function
 */
    socketReady(){
        this.sock.onopen = () => {
            console.log('===> Connected Successfully to Streamlabs');
            this.getCurrentSceneID();
        }
    }

    /**
     * get Current source ID from the StreamLabs OBS
     * @function
     * @returns {string} - CurrentSceneID
     */
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

    /**
     * get the scente items from the sceneID
     * @param {string} sceneID - getted by the function getcurrent SceneID
     * @returns {string} CurrentSourceID asigned from workingSource
     */
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

    /**
     * Send Visibility to the workingsource
     * @param {boolean} toggle 
     */
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
}
module.exports = slobs;