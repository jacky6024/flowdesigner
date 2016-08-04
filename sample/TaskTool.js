/**
 * Created by Jacky.gao on 2016/7/12.
 */
import Tool from '../src/Tool.js';
import TaskNode from './TaskNode.js';

export default class TaskTool extends Tool{
    getType(){
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
    getPropertiesProducer(){
        return function () {
            const container=$(`<div class="form-group"><label>是否生成任务</label></div>`);
            const taskList=$(`<select class="form-control"></select>`);
            container.append(taskList);
            taskList.append(`<option value="true">是</option>`);
            taskList.append(`<option value="false">否</option>`);
            const _this=this;
            taskList.change(function () {
                _this.createTask=$(this).val();
            });
            taskList.val(this.createTask);
            return container;
        }
    }
}
