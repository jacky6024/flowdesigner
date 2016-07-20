/**
 * Created by Jacky.gao on 2016/6/30.
 */
import Tool from '../Tool.js';
export default class ConnectionTool extends Tool{
    getType(){
        return 'Connection';
    }
    getIcon(){
        return `<i class="fd fd-line" style="color:#737383"></i>`;
    }
}