/**
 * Created by Jacky.gao on 2016/6/29.
 */
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './iconfont/iconfont.css';
import FlowDesigner from '../src/FlowDesigner.js'
import StartTool from './StartTool.js';
import EndTool from './EndTool.js';
import TaskTool from './TaskTool.js';

$(document).ready(function () {
    const designer=new FlowDesigner('container');
    designer.addTool(new StartTool());
    designer.addTool(new EndTool());
    designer.addTool(new TaskTool());
    designer.buildDesigner();
});