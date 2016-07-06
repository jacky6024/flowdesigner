/**
 * Created by Jacky.gao on 2016/6/29.
 */
import Tool from '../Tool.js';

export default class SelectTool extends Tool{
    getName(){
        return "Select";
    }
    getIcon(){
        return `<i class="iconfont" style="color:#737383">&#xe601;</i>`
    }
}
