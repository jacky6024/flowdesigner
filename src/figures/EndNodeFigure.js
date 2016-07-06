/**
 * Created by Jacky.gao on 2016/6/30.
 */
import Figure from '../Figure.js';

export default class EndNodeFigure extends Figure{
    getSvgIcon(){
        return '../svg/end.svg';
    }
    getText(){
        return 'end';
    }
}
