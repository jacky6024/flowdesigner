/**
 * Created by Jacky.gao on 2016/7/6.
 */
export default class DragEndpoint{
    constructor(controller){
        this.controller=controller;
        this.context=controller.context;
        this.connection=controller.connection;
        this._init();
    }
    _init(){
        this._initStartPoint();
        this._initEndPoint();
    }
    _initStartPoint(){
        const path=this.connection.path.attr('path');
        const startPoint=path[0];
        this.startRect=this.context.paper.rect(startPoint[1]-3,startPoint[2]-3,6,6);
        this.startRect.attr({'stroke':'#FF5722','fill':'#FF5722','opacity':0});
        this.startRect.mouseover(function (e) {
            this.attr('cursor', 'crosshair');
        });
        const _this=this;
        this.startRect.mouseout(function (e) {
            this.attr('cursor', 'default');
        });
        var dragMove = function(dx, dy) {
            let x=this.ox+dx,y=this.oy+dy;
            if(x<1 || y<1){
                return;
            }
            this.attr('x',x);
            this.attr('y',y);
            _this.context.resizePaper(x+5,y+5);
            const pathInfo=_this.connection.path.attr('path');
            const p=pathInfo[0];
            p[1]=x,p[2]=y;
            _this.connection.path.attr('path',pathInfo);
        };
        var dragStart = function() {
            this.ox=this.attr('x');
            this.oy=this.attr('y');
            _this.controller.removeOthers(_this);
        };
        var dragEnd = function() {
            if(_this.newFrom){
                if(_this.newFrom!==_this.connection.to){
                    const oldFromConnections=_this.connection.from.fromConnections;
                    const index=oldFromConnections.indexOf(_this.connection);
                    oldFromConnections.splice(index,1);
                    _this.connection.from=_this.newFrom;
                    const newFromConnections=_this.newFrom.fromConnections;
                    newFromConnections.push(_this.connection);
                }
            }
            _this.connection.updatePath();
            _this.controller.remove();
        };
        this.startRect.drag(dragMove,dragStart,dragEnd);
        this.startRect.onDragOver(function (e) {
            const id=e.id;
            _this.newFrom=_this.context.getFigureById(id);
        });
    }
    _initEndPoint(){
        const path=this.connection.path.attr('path');
        const endPoint=path[path.length-1];
        this.endRect=this.context.paper.rect(endPoint[1]-3,endPoint[2]-3,6,6);
        this.endRect.attr({'stroke':'#FF5722','fill':'#FF5722','opacity':0});
        this.endRect.mouseover(function (e) {
            this.attr('cursor', 'crosshair');
        });
        this.endRect.mouseout(function (e) {
            this.attr('cursor', 'default');
        });
        const _this=this;
        var dragMove = function(dx, dy) {
            let x=this.ox+dx,y=this.oy+dy;
            if(x<1 || y<1){
                return;
            }
            this.attr('x',x);
            this.attr('y',y);
            _this.context.resizePaper(x+5,y+5);
            const pathInfo=_this.connection.path.attr('path');
            const p=pathInfo[pathInfo.length-1];
            p[1]=x,p[2]=y;
            _this.connection.path.attr('path',pathInfo);
        };
        var dragStart = function() {
            this.ox=this.attr('x');
            this.oy=this.attr('y');
            _this.controller.removeOthers(_this);
        };
        var dragEnd = function() {
            if(_this.newTo){
                if(_this.newTo!==_this.connection.from){
                    const oldToConnections=_this.connection.to.toConnections;
                    const index=oldToConnections.indexOf(_this.connection);
                    oldToConnections.splice(index,1);
                    _this.connection.to=_this.newTo;
                    const newToConnections=_this.newTo.toConnections;
                    newToConnections.push(_this.connection);
                }
            }
            _this.connection.updatePath();
            _this.controller.remove();
        };
        this.endRect.drag(dragMove,dragStart,dragEnd);
        this.endRect.onDragOver(function (e) {
            const id=e.id;
            _this.newTo=_this.context.getFigureById(id);
        });
    }
    remove(){
        this.startRect.remove();
        this.endRect.remove();
    }
}
