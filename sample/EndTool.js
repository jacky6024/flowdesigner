/**
 * Created by Jacky.gao on 2016/7/12.
 */
import Tool from '../src/Tool.js';
import EndNode from './EndNode.js';

export default class EndTool extends Tool{
    getType(){
        return "end";
    }
    getIcon(){
        return `<i class="flow flow-end" style="color:#737383"></i>`
    }
    newNode(){
        return new EndNode();
    }
    getConfigs(){
        return {
            in:-1,
            out:0
        };
    }
}
