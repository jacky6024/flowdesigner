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

        this.rect=this.context.paper.rect(x-3,y-3,5,5);
        this.rect.attr({'stroke':'#FF5722','fill':'#FF5722'});
        this.rect.mouseover(function (e) {
            this.attr('cursor', 'move');
        });
        this.rect.mouseout(function (e) {
            this.attr('cursor', 'default');
        });
        var dragMove = function(dx, dy) {
            let x=this.ox+dx,y=this.oy+dy;
            if(x<1 || y<1){
                return;
            }
            _this.context.resizePaper(x+5,y+5);
            this.attr('x',x);
            this.attr('y',y);
            targetIndex=Math.round(segmentIndex/2);
            let pi=_this.path.attr("path");
            let L=pi.length,dot,p,p1;

            if(targetIndex===1 || targetIndex===0){
                p1=pi[1];
                dot=_this.connection._buildFromFigureIntersetion({x:p1[1],y:p1[2]},true);
                p=pathInfo[0];
            }else if(targetIndex===L-2){
                p1=pi[L-2];
                dot=_this.connection._buildToFigureIntersetion({x:p1[1],y:p1[2]},true);
                p=pathInfo[L-1];
            }
            if(dot){
                if(p1[1]<dot.x){
                    dot.x-=10;
                }else{
                    dot.x+=10;
                }
                if(p1[2]<dot.y){
                    dot.y-=10;
                }else{
                    dot.y+=10;
                }
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
        };
        var dragEnd = function() {
            _this.controller.remove();
        };
        this.rect.drag(dragMove,dragStart,dragEnd);
    }
    remove(){
        this.rect.remove();
    }
}