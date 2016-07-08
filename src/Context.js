/**
 * Created by Jacky.gao on 2016/6/28.
 */
import Raphael from 'raphael';
import SelectTool from './tools/SelectTool.js';
import ConnectionTool from './tools/ConnectionTool.js';
import StartNodeTool from './tools/StartNodeTool.js';
import EndNodeTool from './tools/EndNodeTool.js';
import Connection from './Connection.js';
import * as event from './event.js';
import Figure from './Figure.js';

export default class Context{
    constructor(container){
        this.toolsMap=new Map();
        this._initBuiltinFigures();
        this.container=container;
        this.paper=new Raphael(container[0],'100%','100%');
        this.allFigures=[];
        this.selectionFigures=[];
        this.selectionRects=this.paper.set();
        this.selectionPaths=this.paper.set();
        this.currentConnection=null;
        this.currentTool=null;
        this._initEvent();
    }
    selectFigure(figure){
        this.startSelect();
        this.addSelection(figure);
        this.endSelect();
    }

    startSelect(){
        this.resetSelection();
    }

    resizePaper(newWidth,newHeight){
        const w=this.container.width(),h=this.container.height();
        if(newWidth>w){
            this.container.width(newWidth+10);
        }
        if(newHeight>h){
            this.container.height(newHeight+10);
        }
    }

    getFigureById(id){
        let target;
        this.allFigures.forEach((figure,index)=>{
            if(figure instanceof Figure){
                if(figure.rect.id===id || figure.icon.id===id || figure.text.id===id){
                    target=figure;
                    return false;
                }
            }
        });
        return target;
    }

    addSelection(figure){
        this.selectionFigures.push(figure);
        if(figure instanceof Connection){
            this.selectionPaths.push(figure.path);
        }else{
            this.selectionRects.push(figure.rect);
        }
    }
    endSelect(){
        this.selectionRects.attr("stroke", '#FF9800');
        this.selectionPaths.attr({"stroke":'#999','stroke-dasharray':'20'});
        let firstSelectFigure=null;
        this.selectionFigures.forEach((figure,index)=>{
            if(!firstSelectFigure){
                firstSelectFigure=figure;
            }
            if(figure instanceof Connection){
                figure.select();
            }
        });
        if(firstSelectFigure){
            event.eventEmitter.emit(event.OBJECT_SELECTED,firstSelectFigure);
        }
    }
    resetSelection(){
        this.selectionRects.attr("stroke", '#fff');
        this.selectionPaths.attr({"stroke":'#999','stroke-dasharray':'none'});
        this.selectionRects=this.paper.set();
        this.selectionPaths=this.paper.set();
        this.selectionFigures.forEach((figure,index)=>{
            if(figure instanceof Connection){
                figure.unSelect();
            }
        });
        this.selectionFigures.splice(0,this.selectionFigures.length);
        event.eventEmitter.emit(event.CANVAS_SELECTED);
    }
    registerFigure(figure){
        const name=figure.getName();
        if(figure.has(name)){
            throw `Figure [${name}] already exist.`;
        }
        this.toolsMap.set(name,figure);
    }
    _initEvent(){
        event.eventEmitter.on(event.TRIGGER_TOOL,figureName => {
            if(!this.toolsMap.has(figureName)){
                throw `Figure ${figureName} not exist.`;
            }
            this.currentTool=this.toolsMap.get(figureName);
            if(this.currentConnection){
                this.currentConnection.path.remove();
            }
        });
        event.eventEmitter.on(event.REMOVE_CLICKED,()=>{
            const selections=[...this.selectionFigures];
            if(selections===0){
                return;
            }
            this.resetSelection();
            selections.forEach((select,index)=>{
                select.remove();
                let i=this.allFigures.indexOf(select);
                this.allFigures.splice(i,1);
            });
        });
        event.eventEmitter.on(event.ALIGN_CENTER,()=>{
            let x=-1,y=-1,w;
            this.selectionFigures.forEach((select,index)=>{
                if(select instanceof Connection){
                    return false;
                }
                if(index===0){
                    x=select.rect.attr('x'),w=select.rect.attr('width');
                    x+=w/2;
                }else{
                    select.moveTo(x,y);
                }
            });
        });
        event.eventEmitter.on(event.ALIGN_MIDDLE,()=>{
            let x=-1,y=-1,h;
            this.selectionFigures.forEach((select,index)=>{
                if(select instanceof Connection){
                    return false;
                }
                if(index===0){
                    y=select.rect.attr('y'),h=select.rect.attr('height');
                    y+=h/2;
                }else{
                    select.moveTo(x,y);
                }
            });
        });
        event.eventEmitter.on(event.UNIFY_SIZE,()=>{
            let w,h;
            this.selectionFigures.forEach((select,index)=>{
                if(select instanceof Connection){
                    return false;
                }
                if(index===0){
                    w=select.rect.attr('width'),h=select.rect.attr('height');
                }else{
                    select.changeSize(w,h);
                }
            });
        });
    }
    _initBuiltinFigures(){
        const selectTool=new SelectTool(this),
            startNodeTool=new StartNodeTool(this),
            endNodeTool=new EndNodeTool(this),
            connectionTool=new ConnectionTool(this);
        this.toolsMap.set(selectTool.getName(),selectTool);
        this.toolsMap.set(connectionTool.getName(),connectionTool);
        this.toolsMap.set(startNodeTool.getName(),startNodeTool);
        this.toolsMap.set(endNodeTool.getName(),endNodeTool);
    }
}
