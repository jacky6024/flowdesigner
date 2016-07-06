/**
 * Created by Jacky.gao on 2016/6/30.
 */
import Figure from '../Figure.js';

export default class StartNodeFigure extends Figure{
    getSvgIcon(){
        return '../svg/start.svg';
    }
    getText(){
        return '开始节点';
    }
}
