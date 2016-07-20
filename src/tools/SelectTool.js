/**
 * Created by Jacky.gao on 2016/6/29.
 */
import Tool from '../Tool.js';

export default class SelectTool extends Tool{
    getType(){
        return "Select";
    }
    getIcon(){
        return `<i class="fd fd-select" style="color:#737383"></i>`
    }
}
