/**
 * Created by Jacky.gao on 2016/6/28.
 */
import Raphael from 'raphael';
import DragController from './DragController.js';

export default class Connection{
    constructor(figure,pos){
        this.context=figure.context;
        this.context.allFigures.push(this);
        this.from=figure;
        this.to=null;
        this.endX=pos.endX;
        this.endY=pos.endY;
        this.selected=false;
        this.type='curve';
        this.init();
    }
    init(){
        this.path=this.context.paper.path(this.buildPathInfo());
        this.path.attr({'stroke-width':'2px','stroke':'#000',"arrow-end": "block-wide-long"});
        this.path.click(function () {
            if(this.selected){
                this.path.attr({'stroke':'#000'});
                this.selected=false;
            }else{
                this.path.attr({'stroke':'red'});
                this.selected=true;
            }
        }.bind(this));
        this.path.toBack();
    }

    select(){
        this.dragController=new DragController(this);
    }

    unSelect(){
        if(this.dragController){
            this.dragController.remove();
        }
    }

    updatePath(){
        this.path.attr('path',this.buildPathInfo());
    }
    endPath(endFigure){
        this.to=endFigure;
        this.updatePath();
    }
    buildPathInfo(){
        if(this.type==='curve'){
            return this._buildCurveLinePathInfo();
        }else if(this.type==='line'){
            return this._buildStraightLinePathInfo();
        }else{
            throw `Unknown connection type [${this.type}]`;
        }
    }

    _buildStraightLinePathInfo(){
        const fromRect=this.from.rect;
        let x1=fromRect.attr('x'),y1=fromRect.attr('y'),w1=fromRect.attr('width'),h1=fromRect.attr('height');
        x1+=w1/2,y1+=h1/2;
        let x2=this.endX,y2=this.endY,w2=0,h2=0;
        if(this.to){
            const toRect=this.to.rect;
            x2=toRect.attr('x'),y2=toRect.attr('y'),w2=toRect.attr('width'),h2=toRect.attr('height');
            x2+=w2/2,y2+=h2/2;
        }
        let pathInfo=null;
        if(this.path){
            pathInfo=this.path.attr('path');
            if(pathInfo && pathInfo.length===2)pathInfo=null;
        }
        let path=path='M'+x1+' '+y1+' L'+x2+' '+y2;
        if(pathInfo){
            let firstLineEnd=pathInfo[1];
            path='M'+x1+' '+y1+' L'+firstLineEnd[1]+' '+firstLineEnd[2];
        }
        let dot=this._buildFromFigureIntersetion(path);
        if(dot){
            x1=dot.x,y1=dot.y;
        }
        if(this.to){
            if(pathInfo){
                let lastLineStart=pathInfo[pathInfo.length-2];
                let lastLineEnd=pathInfo[pathInfo.length-1];
                path='M'+lastLineStart[1]+' '+lastLineStart[2]+' L'+x2+' '+y2;
            }
            dot=this._buildToFigureIntersetion(path);
            if(dot){
                x2=dot.x,y2=dot.y;
            }
        }
        if(x1<x2){
            x2-=10;
        }else{
            x2+=10;
        }
        if(y1<y2){
            y2-=10;
        }else{
            y2+=10;
        }
        if(pathInfo){
            let pathSegmentLength=pathInfo.length;
            let newPathInfo=[];
            pathInfo.forEach((path,index)=>{
                if(index===0){
                    newPathInfo.push(['M',x1,y1]);
                }else if(index===pathSegmentLength-1){
                    newPathInfo.push(['L',x2,y2]);
                }else{
                    let newPath=['L'];
                    newPath.push(path[1]);
                    newPath.push(path[2]);
                    newPathInfo.push(newPath);
                }
            });
            return newPathInfo;
        }else{
            return 'M'+x1+' '+y1+' L'+x2+' '+y2;
        }
    }

    _buildFromFigureIntersetion(path,c){
        if(c){
            const fromRect=this.from.rect;
            let x1=fromRect.attr('x'),y1=fromRect.attr('y'),w1=fromRect.attr('width'),h1=fromRect.attr('height');
            x1+=w1/2,y1+=h1/2;
            path='M'+x1+' '+y1+ ' L'+path.x+' '+path.y;
        }
        const fromFigurePathInfo=this.from.getPathInfo();
        let dot=Raphael.pathIntersection(fromFigurePathInfo,path);
        if(dot.length>0){
            return {x:dot[0].x,y:dot[0].y};
        }
        return null;
    }
    _buildToFigureIntersetion(path,c){
        if(c){
            const toRect=this.to.rect;
            let x2=toRect.attr('x'),y2=toRect.attr('y'),w2=toRect.attr('width'),h2=toRect.attr('height');
            x2+=w2/2,y2+=h2/2;
            path='M'+path.x+' '+path.y+' L'+x2+' '+y2;
        }
        const toFigurePathInfo=this.to.getPathInfo();
        let dot=Raphael.pathIntersection(toFigurePathInfo,path);
        if(dot.length>0){
            return {x:dot[0].x,y:dot[0].y};
        }
        return null;
    }

    _buildCurveLinePathInfo(){
        const fromRect=this.from.rect;
        let x1=fromRect.attr('x'),y1=fromRect.attr('y'),w1=fromRect.attr('width'),h1=fromRect.attr('height');
        x1+=w1/2,y1+=h1/2-10;
        let x2=this.endX,y2=this.endY,w2=0,h2=0,pathInfo=null;
        if(this.to){
            const toRect=this.to.rect;
            x2=toRect.attr('x'),y2=toRect.attr('y'),w2=toRect.attr('width'),h2=toRect.attr('height');
            x2+=w2/2,y2+=h2/2-10;
        }
        const fromFigurePathInfo=this.from.getPathInfo();
        let dis1=Math.abs((x1+w1/2)-(x2-w2/2)),dis2=Math.abs((y1+h1/2)-(y2-h2/2));
        let line1StartPoint='M'+x1+' '+y1;
        if(dis1>=dis2){
            let firstLine=line1StartPoint+' L'+x2+' '+y1;
            let dot=Raphael.pathIntersection(fromFigurePathInfo,firstLine);
            if(dot.length>0){
                x1=dot[0].x,y1=dot[0].y;
                line1StartPoint='M'+dot[0].x+' '+dot[0].y;
            }
            if(this.to){
                let lastLine='M'+x1+' '+y2+' L'+x2+' '+y2;
                let toFigurePathInfo=this.to.getPathInfo();
                dot=Raphael.pathIntersection(toFigurePathInfo,lastLine);
                if(dot.length>0){
                    x2=dot[0].x,y2=dot[0].y;
                    if(x1<x2){
                        x2-=10;
                    }else{
                        x2+=10;
                    }
                }
            }
            let dx=x2-x1,dy=y2-y1;
            pathInfo=line1StartPoint+' L'+(x1+dx/2)+' '+y1+' L'+(x1+dx/2)+' '+(y1+dy)+' L'+x2+' '+y2;
        }else{
            let firstLine=line1StartPoint+' L'+x1+' '+y2;
            let dot=Raphael.pathIntersection(fromFigurePathInfo,firstLine);
            if(dot.length>0){
                x1=dot[0].x,y1=dot[0].y;
                line1StartPoint='M'+dot[0].x+' '+dot[0].y;
            }
            if(this.to){
                let lastLine='M'+x2+' '+y1+' L'+x2+' '+y2;
                let toFigurePathInfo=this.to.getPathInfo();
                dot=Raphael.pathIntersection(toFigurePathInfo,lastLine);
                if(dot.length>0){
                    x2=dot[0].x,y2=dot[0].y;
                    if(y1<y2){
                        y2-=10;
                    }else{
                        y2+=10;
                    }
                }
            }
            let dx=x2-x1,dy=y2-y1;
            pathInfo=line1StartPoint+' L'+x1+' '+(y1+dy/2)+' L'+(x1+dx)+' '+(y1+dy/2)+' L'+x2+' '+y2;
        }
        return pathInfo;
    }
}