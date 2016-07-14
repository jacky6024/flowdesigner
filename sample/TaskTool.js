/**
 * Created by Jacky.gao on 2016/7/12.
 */
import Tool from '../src/Tool.js';
import TaskNode from './TaskNode.js';

export default class TaskTool extends Tool{
    getName(){
        return "task";
    }
    getIcon(){
        return `<i class="flow flow-man" style="color:#737383"></i>`
    }
    newNode(){
        return new TaskNode();
    }
    getConfigs(){
        return {
            in:-1,
            out:-1
        };
    }
}
