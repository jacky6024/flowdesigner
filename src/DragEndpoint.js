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
            _this.context.resizePaper(x+10,y+10);
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
                if(_this.newFrom!==_this.connection.from){
                    const newFromNodeUUID=_this.newFrom.uuid,oldFromNodeUUID=_this.connection.from.uuid,connectionUUID=_this.connection.uuid;
                    _this.connection.changeFromNode(_this.newFrom);
                    _this.context.addRedoUndo({
                        redo:function () {
                            const targetNode=_this.context.getNodeByUUID(newFromNodeUUID);
                            const conn=_this.context.getNodeByUUID(connectionUUID);
                            conn.changeFromNode(targetNode);
                        },
                        undo:function () {
                            const targetNode=_this.context.getNodeByUUID(oldFromNodeUUID);
                            const conn=_this.context.getNodeByUUID(connectionUUID);
                            conn.changeFromNode(targetNode);
                        }
                    })
                }
            }
            _this.controller.remove();
            if(window._setDirty){
                window._setDirty();
            }
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
                    const newToNodeUUID=_this.newTo.uuid,oldToNodeUUID=_this.connection.to.uuid,connectionUUID=_this.connection.uuid;
                    _this.connection.changeToNode(_this.newTo);
                    _this.context.addRedoUndo({
                        redo:function () {
                            const targetNode=_this.context.getNodeByUUID(newToNodeUUID);
                            const conn=_this.context.getNodeByUUID(connectionUUID);
                            conn.changeToNode(targetNode);
                        },
                        undo:function () {
                            const targetNode=_this.context.getNodeByUUID(oldToNodeUUID);
                            const conn=_this.context.getNodeByUUID(connectionUUID);
                            conn.changeToNode(targetNode);
                        }
                    });
                }
            }
            _this.controller.remove();
            if(window._setDirty){
                window._setDirty();
            }
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
        if(window._setDirty){
            window._setDirty();
        }
    }
}
