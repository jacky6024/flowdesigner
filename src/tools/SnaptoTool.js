/**
 * Created by Jacky.gao on 2016/6/30.
 */
import Tool from '../Tool.js';
export default class SnaptoTool extends Tool{
    getName(){
        return 'Snap to grid';
    }
    getIcon(){
        return `<i class="iconfont" style="color:#737383">&#xe602;</i>`;
    }
}