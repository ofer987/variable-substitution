import core = require("@actions/core");

import { EnvTreeUtility } from "./envVariableUtility";

export class JsonSubstitution {
    constructor() {
        this.envTreeUtil = new EnvTreeUtility();
    }

    substituteJsonVariable(jsonObject, envObject) {
        let isValueChanged: boolean = false;
        for(let jsonChild in jsonObject) {
            console.log(`jsonChild is ${jsonChild}`);

            let jsonChildArray = jsonChild.split('.');
            let resultNode = this.envTreeUtil.checkEnvTreePath(jsonChildArray, 0, jsonChildArray.length, envObject);
            if(resultNode != undefined) {
                if(resultNode.isEnd) {
                    console.log(`jsonObject[jsonChild] is ${jsonObject[jsonChild]}`);
                    console.log(`and its type is ${typeof(jsonObject[jsonChild])}`);

                    switch(typeof(jsonObject[jsonChild])) {
                        case 'number':
                            console.log('SubstitutingValueonKeyWithNumber', jsonChild , resultNode.value);
                            jsonObject[jsonChild] = !isNaN(resultNode.value) ? Number(resultNode.value): resultNode.value;
                            break;
                        case 'boolean':
                            console.log('SubstitutingValueonKeyWithBoolean' , jsonChild , resultNode.value);
                            jsonObject[jsonChild] = (
                                resultNode.value == 'true' ? true : (resultNode.value == 'false' ? false : resultNode.value)
                            )
                            break;
                        case 'object':
                        case null:
                            try {
                                console.log('SubstitutingValueonKeyWithObject' , jsonChild , resultNode.value);
                                jsonObject[jsonChild] = JSON.parse(resultNode.value);
                            }
                            catch(exception) {
                                core.debug('unable to substitute the value. falling back to string value');
                                jsonObject[jsonChild] = resultNode.value;
                            }
                            break;
                        case 'string':
                            console.log('SubstitutingValueonKeyWithString' , jsonChild , resultNode.value);
                            jsonObject[jsonChild] = resultNode.value;
                    }
                    isValueChanged = true;
                }
                else {
                    isValueChanged = this.substituteJsonVariable(jsonObject[jsonChild], resultNode) || isValueChanged;
                }
            }
        }
        return isValueChanged;
    }

    private envTreeUtil: EnvTreeUtility;
}
