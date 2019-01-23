/**
 * Created by Jacky.gao on 2016/7/4.
 */
export default class DragPoint{
    constructor(controller,segmentIndex){
        this.controller=controller;
        this.context=controller.context;
        this.connection=controller.connection;
        this.path=controller.path;
        this._init(segmentIndex);
    }
    _init(segmentIndex){
        const _this=this;
        let pathInfo=this.path.attr('path');
        let x,y;
        let isCornerPoint=(segmentIndex%2===0)?false:true;
        let targetIndex=Math.round(segmentIndex/2);
        if(isCornerPoint){
            let cornerPoint=pathInfo[targetIndex];
            x=cornerPoint[1],y=cornerPoint[2];
        }else{
            let start=pathInfo[targetIndex],end=pathInfo[targetIndex+1];
            let dx=end[1]-start[1],dy=end[2]-start[2];
            x=start[1]+dx/2,y=start[2]+dy/2;
        }

        this.rect=this.context.paper.rect(x-4,y-4,6,6);
        this.rect.attr({'stroke':'#FF5722','fill':'#FF5722'});
        this.rect.mouseover(function (e) {
            this.attr('cursor', 'move');
        });
        this.rect.mouseout(function (e) {
            this.attr('cursor', 'default');
        });
        this.rect.dblclick(function(e){
            let pi=_this.path.attr("path");
            if(segmentIndex===0 || (segmentIndex % 2)===0){
                _this.remove();
                return;
            }
            let index=1;
            if(segmentIndex>1){
                index=(segmentIndex+1)/2;
            }
            pi.splice(index,1);
            if(pi.length===2){
                pi=_this.connection._buildStraightLinePathInfo();
            }else{
                let ps=pi[1];
                let startDot=_this.connection._buildFromFigureIntersetion({x:ps[1],y:ps[2]},true);
                let startPoint=pi[0];
                startPoint[1]=startDot.x;
                startPoint[2]=startDot.y;
                let pe=pi[pi.length-2];
                let endDot=_this.connection._buildToFigureIntersetion({x:pe[1],y:pe[2]},true);
                let endPoint=pi[pi.length-1];
                endPoint[1]=endDot.x;
                endPoint[2]=endDot.y;
            }
            _this.path.attr('path',pi);
            _this.remove();
            if(window._setDirty){
                window._setDirty();
            }
        });
        var dragMove = function(dx, dy) {
            if(_this.context.snapto){
                dx-=dx%10,dy-=dy%10;
            }
            let x=this.ox+dx,y=this.oy+dy;
            if(x<1 || y<1){
                return;
            }
            _this.context.resizePaper(x+15,y+15);
            this.attr('x',x);
            this.attr('y',y);
            targetIndex=Math.round(segmentIndex/2);
            let pi=_this.path.attr("path");
            let L=pi.length,dot,p,p1;

            let segmentCount=(pathInfo.length-1)*2-1;
            if(segmentIndex===0 || segmentIndex===1){
                p1=pi[1];
                dot=_this.connection._buildFromFigureIntersetion({x:p1[1],y:p1[2]},true);
                p=pathInfo[0];
                if(pathInfo.length===2){
                    let endDot=_this.connection._buildToFigureIntersetion({x,y},true);
                    if(endDot){
                        let pp=pathInfo[pathInfo.length-1];
                        pp[1]=endDot.x,pp[2]=endDot.y;
                    }
                }
            }else if(segmentCount===segmentIndex || (segmentCount===segmentIndex+1) || (segmentCount===segmentIndex+2)){
                p1=pi[L-2];
                dot=_this.connection._buildToFigureIntersetion({x,y},true);
                p=pathInfo[pathInfo.length-1];
            }
            if(dot){
                p[1]=dot.x,p[2]=dot.y;
            }
            let newPathInfo=[];
            pathInfo.forEach((p,index)=>{
                if(isCornerPoint){
                    if(index===targetIndex){
                        newPathInfo.push(['L',x,y]);
                    }else{
                        newPathInfo.push(p);
                    }
                }else{
                    newPathInfo.push(p);
                    if(index===targetIndex){
                        newPathInfo.push(['L',x,y]);
                    }
                }
            });
            _this.path.attr('path',newPathInfo);
            _this.connection._buildText();
        };
        var dragStart = function() {
            this.ox=this.attr('x');
            this.oy=this.attr('y');
            _this.controller.removeOthers(_this);
            this.oldConnectionPathInfo=_this.connection.buildPathInfo();
        };
        var dragEnd = function() {
            const newConnectionPathInfo=_this.connection.buildPathInfo(),oldConnectionPathInfo=this.oldConnectionPathInfo,uuid=_this.connection.uuid;
            _this.context.addRedoUndo({
                redo:function () {
                    const conn=_this.context.getNodeByUUID(uuid);
                    conn.pathInfo=newConnectionPathInfo;
                    conn.updatePath();
                    conn._buildText();
                },
                undo:function () {
                    const conn=_this.context.getNodeByUUID(uuid);
                    conn.pathInfo=oldConnectionPathInfo;
                    conn.updatePath();
                    conn._buildText();
                }
            });
        };
        this.rect.drag(dragMove,dragStart,dragEnd);
        if(window._setDirty){
            window._setDirty();
        }
    }
    remove(){
        this.rect.remove();
        if(window._setDirty){
            window._setDirty();
        }
    }
}