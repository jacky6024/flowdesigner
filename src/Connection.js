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
        this.name=this.buildConnectionName(node);
        this.from.fromConnections.push(this);
        this.to=null;
        this.endX=pos.endX;
        this.endY=pos.endY;
        this.type='line';
        this.init();
    }
    init(){
        this.path=this.context.paper.path(this.buildPathInfo());
        this.path.attr({'stroke-width':'2px','stroke':'#999',"arrow-end": "block-wide-long"});
        this.path.toBack();
    }

    buildConnectionName(fromNode){
        let conns=fromNode.fromConnections,name=null;
        if(conns.length===0){
            return null;
        }
        for(let i=0;i<1000000;i++){
            name='c'+i;
            let exist=false;
            for(let conn of conns){
                if(conn.name && conn.name===name){
                    exist=true;
                    break;
                }
            }
            if(!exist){
                break;
            }
        }
        return name;
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
        if(window._setDirty){
            window._setDirty();
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
        }else if(this.g){
            const ga=this.g.split(','),L=ga.length;
            const path=[];
            const fromRect=this.from.rect,toRect=this.to.rect;
            let x1=fromRect.attr('x'),y1=fromRect.attr('y'),w1=fromRect.attr('width'),h1=fromRect.attr('height');
            x1+=w1/2,y1+=h1/2-10;
            path.push(['M',x1,y1]);
            path.push(['L',ga[0],ga[1]]);
            let dot=this._buildFromFigureIntersetion(path);
            if(dot){
                x1=dot.x,y1=dot.y;
            }

            path.splice(0,path.length-1);
            path.push(['M',ga[L-2],ga[L-1]]);
            let x2=toRect.attr('x'),y2=toRect.attr('y'),w2=toRect.attr('width'),h2=toRect.attr('height');
            x2+=w2/2,y2+=h2/2-10;
            path.push(['L',x2,y2]);
            dot=this._buildToFigureIntersetion(path);
            if(dot){
                x2=dot.x,y2=dot.y;
            }
            let i=0,pathInfo=[['M',x1,y1]];
            while(i<L){
                pathInfo.push(['L',ga[i],ga[i+1]]);
                i+=2;
            }
            pathInfo.push(['L',x2,y2]);
            this.path.attr('path',pathInfo);
            this.g=null;
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
        this.g=json.g;
        this.name=json.name;
        for(const prop in json){
            if(!prop || prop==='to' || prop==='toNode'){
                continue;
            }
            this[prop]=json[prop];
        }
        this.type=json.type || 'line';
        if(json.uuid){
            this.uuid=json.uuid;
        }
        this.updatePath();
    }

    toJSON(){
        const json={};
        for(const prop in this){
            if(!prop || prop==='to' || prop==='toNode'){
                continue;
            }
            json[prop]=this[prop];
        }
        json.path=this.path.attr('path');
        json.name=this.name;
        json.uuid=this.uuid;
        json.type=this.type;
        json.to=this.to.name;
        json.toUUID=this.to.uuid;
        json.from=this.from.name;
        json.fromUUID=this.from.uuid;
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
        let path=[['M',x1,y1],['L',x2,y2]];
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
        const fromFigurePathInfo=this.from.getPathInfo(true);
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
        const toFigurePathInfo=this.to.getPathInfo(true);
        let dot=Raphael.pathIntersection(toFigurePathInfo,path);
        if(dot.length>0){
            let p={x:path[0][1],y:path[0][2]};
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
        const fromFigurePathInfo=this.from.getPathInfo(true);
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
                let toFigurePathInfo=this.to.getPathInfo(true);
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
                let toFigurePathInfo=this.to.getPathInfo(true);
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