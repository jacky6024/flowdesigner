/**
 * Created by Jacky.gao on 2016/6/30.
 */
import Tool from '../Tool.js';
import EndNodeFigure from '../figures/EndNodeFigure.js';
export default class EndNodeTool extends Tool{
    getName(){
        return 'End';
    }
    getIcon(){
        return `<i class="iconfont icon-end" style="color:#737383"></i>`
    }
    newFigure(){
        return new EndNodeFigure();
    }
}
