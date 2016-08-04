/**
 * Created by Jacky.gao on 2016/7/12.
 */
import Tool from '../src/Tool.js';
import StartNode from './StartNode.js';

export default class StartTool extends Tool{
    getType(){
        return "start";
    }
    getIcon(){
        return `<i class="flow flow-start" style="color:#737383"></i>`
    }
    newNode(){
        return new StartNode();
    }
    getConfigs(){
        return {
            in:0,
            out:1,
            single:true
        };
    }
}
