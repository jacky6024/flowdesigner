/**
 * Created by Jacky.gao on 2016/7/4.
 */
import DragPoint from './DragPoint.js';
import DragEndpoint from './DragEndpoint.js';
export default class DragController{
    constructor(connection){
        this.context=connection.context;
        this.connection=connection;
        this.path=connection.path;
        this.points=[];
        this._init();
    }
    _init(){
        let path=this.path.attr('path');
        let segmentCount=(path.length-1)*2-1;
        for(let i=0;i<segmentCount;i++){
            let point=new DragPoint(this,i);
            this.points.push(point);
        }
        this.dragEndpoint=new DragEndpoint(this);
    }
    remove(){
        this.points.forEach((point,index)=>{
            point.remove();
        });
        this.points.splice(0,this.points.length);
        this.dragEndpoint.remove();
        if(window._setDirty){
            window._setDirty();
        }
    }
    removeOthers(currentPoint){
        this.points.forEach((point,index)=>{
            if(point!==currentPoint){
                point.remove();
            }
        });
        if(this.dragEndpoint!==currentPoint){
            this.dragEndpoint.remove();
        }
        if(window._setDirty){
            window._setDirty();
        }
    }
}
