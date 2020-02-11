const SockJS = require('sockjs-client'); 
class slobs {
    constructor(slobsAPIURL){
        this.sock = new SockJS(slobsAPIURL);
        this.commandSource = "";
        console.log('slobs - constructor');
        
        this.getCurrentSceneID();
    }

    getCurrentSceneID(){
        this.sock.onopen = () => {
            console.log('===> Connected Successfully to Streamlabs');
            this.sock.send(
                /*JSON.stringify({
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "getSources",
                    "params": {
                    "resource": "SourcesService",
                    "args": []
                    }
                })*/
                JSON.stringify({
                    "jsonrpc": "2.0",
                    "id": 3,
                    "method": "activeSceneId",
                    "params": {
                        "resource": "ScenesService",
                        "args": []
                    }
                })      
            );
        };

        this.sock.onmessage = e => {
            // Parse JSON Data
            /*
                result[0].activeScene
                result[0].sceneName
                result[0].name
             */
            var response = JSON.parse(e.data, undefined, 2);
            this.CurrentSceneID = response.result
            console.log(`slobs - constructor - response: ${response.result}`);
            var resArrRes = response.result;
            //resArrRes.forEach(function (element){
                //var nelem = JSON.parse(element);
             //   console.log(`slobs - constructor - onmessage - element: ${element}`);
            //})
            //console.log('slobs - constructor:'+JSON.stringify(response.result[0]));
        }
    }

    /* SOCKET EVENTS AND ACCTIONS */
    goCommands(sceneItem, toggle){
        console.log('slobs - goCommands');
        
        this.sock.onopen = () => {
            console.log('===> Connected Successfully to Streamlabs');
            this.sock.send(
                JSON.stringify({
                    "jsonrpc": "2.0",
                    "id": 14,
                    "method": "setVisibility",
                    "params": {
                        "resource": sceneItem,
                        "args": [
                            toggle
                        ]
                    }
                })
            );
        };
        this.sock.onmessage = e => {
            // Parse JSON Data
            /*
                result[0].activeScene
                result[0].sceneName
                result[0].name
             */
            var response = JSON.parse(e.data);
            console.log('slobs - onmessage:'+response.result);
            /*response.result.forEach(function (element){
                console.log('slobs - element: '+ element);
            });*/
            //console.log('slobs - sock: '+response.result[0].activeScene);
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