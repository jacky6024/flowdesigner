/**
 * Created by Jacky.gao on 2016/6/29.
 */
import Tool from '../Tool.js';
import StartNodeFigure from '../figures/StartNodeFigure.js';
export default class StartNodeTool extends Tool{
    getName(){
        return 'Start';
    }
    getIcon(){
        return `<i class="iconfont icon-start" style="color:#737383"></i>`
    }
    newFigure(){
        return new StartNodeFigure();
    }
};