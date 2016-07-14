/**
 * Created by Jacky.gao on 2016/6/28.
 */
import Raphael from 'raphael';
import DragController from './DragController.js';

export default class Connection{
    constructor(node,pos){
        this.context=node.context;
        this.uuid=this.context.nextUUID();
        this.context.allFigures.push(this);
        this.from=node;
        this.from.fromConnections.push(this);
        this.to=null;
        this.endX=pos.endX;
        this.endY=pos.endY;
        this.selected=false;
        this.type='line';
        this.init();
    }
    init(){
        this.path=this.context.paper.path(this.buildPathInfo());
        this.path.attr({'stroke-width':'2px','stroke':'#999',"arrow-end": "block-wide-long"});
        this.path.toBack();
    }

    changeFromNode(newFrom){
        const oldFromConnections=this.from.fromConnections;
        const index=oldFromConnections.indexOf(this);
        oldFromConnections.splice(index,1);
        this.from=newFrom;
        const newFromConnections=newFrom.fromConnections;
        newFromConnections.push(this);
        this.updatePath();
    }

    changeToNode(newTo){
        const oldToConnections=this.to.toConnections;
        const index=oldToConnections.indexOf(this);
        oldToConnections.splice(index,1);
        this.to=newTo;
        const newToConnections=newTo.toConnections;
        newToConnections.push(this);
        this.updatePath();
    }

    remove(){
        const toConns=this.to.toConnections,fromConns=this.from.fromConnections;
        const toIndex=toConns.indexOf(this),fromIndex=fromConns.indexOf(this);
        toConns.splice(toIndex,1);
        fromConns.splice(fromIndex,1);
        this.path.remove();
        if(this.text){
            this.text.remove();
        }
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
        if(this.pathInfo){
            this.path.attr('path',this.pathInfo);
            this.pathInfo=null;
        }else{
            this.path.attr('path',this.buildPathInfo());
        }
        this._buildText();
    }
    endPath(toNode){
        this.to=toNode;
        toNode.toConnections.push(this);
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

    fromJSON(json){
        this.pathInfo=json.path;
        this.type=json.type;
        this.name=json.name;
        if(json.uuid){
            this.uuid=json.uuid;
        }
        this.updatePath();
    }

    toJSON(){
        const json = {
            path: this.buildPathInfo(),
            text:this.name,
            uuid:this.uuid,
            type:this.type,
            to:this.to.name,
            toUUID:this.to.uuid,
            from:this.from.name,
            fromUUID:this.from.uuid
        };
        return json;
    }

    _buildStraightLinePathInfo(){
        const fromRect=this.from.rect;
        let x1=fromRect.attr('x'),y1=fromRect.attr('y'),w1=fromRect.attr('width'),h1=fromRect.attr('height');
        x1+=w1/2,y1+=h1/2-10;
        let x2=this.endX,y2=this.endY,w2=0,h2=0;
        if(this.to){
            const toRect=this.to.rect;
            x2=toRect.attr('x'),y2=toRect.attr('y'),w2=toRect.attr('width'),h2=toRect.attr('height');
            x2+=w2/2,y2+=h2/2-10;
        }
        let pathInfo=null;
        if(this.path){
            pathInfo=this.path.attr('path');
            if(pathInfo && pathInfo.length===2)pathInfo=null;
        }
        let path=[['M',x1,y1],['L',x2,y2]];//'M'+x1+' '+y1+' L'+x2+' '+y2;
        if(pathInfo){
            let firstLineEnd=pathInfo[1];
            path=[['M',x1,y1]];
            path.push(firstLineEnd);
        }
        let dot=this._buildFromFigureIntersetion(path);
        if(dot){
            x1=dot.x,y1=dot.y;
        }
        if(this.to){
            if(pathInfo){
                let lastLineStart=pathInfo[pathInfo.length-2];
                path=[];
                path.push(lastLineStart);
                path.push(['L',x2,y2]);
            }
            dot=this._buildToFigureIntersetion(path);
            if(dot){
                x2=dot.x,y2=dot.y;
            }
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
            x1+=w1/2,y1+=h1/2-10;
            let x=path.x,y=path.y;
            path=[];
            path.push(['M',x1,y1]);
            path.push(['L',x,y]);
        }
        const fromFigurePathInfo=this.from.getPathInfo();
        let dot=Raphael.pathIntersection(fromFigurePathInfo,path);
        if(dot.length>0){
            let p={x:path[1][1],y:path[1][2]};
            return {x:dot[0].x,y:dot[0].y};
        }
        return null;
    }
    _buildToFigureIntersetion(path,c){
        if(c){
            const toRect=this.to.rect;
            let x2=toRect.attr('x'),y2=toRect.attr('y'),w2=toRect.attr('width'),h2=toRect.attr('height');
            x2+=w2/2,y2+=h2/2-10;
            let x=path.x,y=path.y;
            path=[];
            path.push(['M',x,y]);
            path.push(['L',x2,y2]);
        }
        const toFigurePathInfo=this.to.getPathInfo();
        let dot=Raphael.pathIntersection(toFigurePathInfo,path);
        if(dot.length>0){
            let p={x:path[0][1],y:path[0][2]};
            this._buildIntersectionDot(p,dot);
            return {x:dot[0].x,y:dot[0].y};
        }
        return null;
    }

    _buildIntersectionDot(p,dot){
        const d=dot[0];
        const mpx=Math.round(p.x),mdx=Math.round(d.x),mpy=Math.round(p.y),mdy=Math.round(d.y);
        if(mpx===mdx){
            if(mpy>mdy){
                d.y+=10;
            }else if(mpy<mdy){
                d.y-=10;
            }
        }else if(mpx>mdx){
            d.x+=10;
            if(mpy>mdy){
                d.y+=10;
            }else if(mpy<mdy){
                d.y-=10;
            }
        }else if(mpx<mdx){
            d.x-=10;
            if(mpy>mdy){
                d.y+=10;
            }else if(mpy<mdy){
                d.y-=10;
            }
        }
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

    _buildText(){
        if(!this.name){
            return;
        }
        let pos;
        const pathInfo=this.path.attr('path');
        if(pathInfo.length===2){
            const start=pathInfo[0],end=pathInfo[1];
            pos={x:start[1]+(end[1]-start[1])/2,y:start[2]+(end[2]-start[2])/2};
        }else{
            const targetPointIndex=Math.round(pathInfo.length/2)-1;
            const point=pathInfo[targetPointIndex];
            pos={x:point[1],y:point[2]};
        }
        if(this.text){
            this.text.attr({x:pos.x+10,y:pos.y+10,text:this.name});
        }else{
            this.text=this.context.paper.text(pos.x+10,pos.y+10,this.name);
            this.text.attr({'font-size':'14pt','fill':'#2196F3'});
            this.text.mousedown(function(e){
                e.preventDefault();
            });
        }
    }
}