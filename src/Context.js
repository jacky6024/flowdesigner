/**
 * Created by Jacky.gao on 2016/6/28.
 */
import Raphael from 'raphael';
import UndoManager from 'undo-manager';
import uuid from 'node-uuid';
import SelectTool from './tools/SelectTool.js';
import ConnectionTool from './tools/ConnectionTool.js';
import Connection from './Connection.js';
import * as event from './event.js';
import Node from './Node.js';

export default class Context{
    constructor(container){
        this.undoManager = new UndoManager();
        this.toolsMap=new Map();
        this._initBuiltinTools();
        this.container=container;
        this.paper=new Raphael(container[0],'100%','100%');
        this.allFigures=[];
        this.selectionFigures=[];
        this.selectionRects=this.paper.set();
        this.selectionPaths=this.paper.set();
        this.currentConnection=null;
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

    addRedoUndo(redoUndo){
        this.undoManager.add(redoUndo);
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
    registerTool(tool){
        const type=tool.getType();
        if(this.toolsMap.has(type)){
            throw `Figure [${type}] already exist.`;
        }
        this.toolsMap.set(type,tool);
    }

    nextUUID(){
        return uuid.v1();
    }

    getFigureById(id){
        let target;
        for(let figure of this.allFigures){
            if(figure instanceof Node){
                if(figure.rect.id===id || figure.icon.id===id || figure.text.id===id){
                    target=figure;
                    break;
                }
            }
        }
        return target;
    }

    getNodeByUUID(uuid){
        let targetNode;
        for(let node of this.allFigures){
            if(node.uuid===uuid){
                targetNode=node;
                break;
            }
        }
        return targetNode;
    }

    removeFigureByUUID(uuid){
        const targetNode=this.getNodeByUUID(uuid);
        const pos=this.allFigures.indexOf(targetNode);
        this.allFigures.splice(pos,1);
        targetNode.remove();
    }

    cancelConnection(){
        if(this.currentConnection){
            const fromConnections=this.currentConnection.from.fromConnections;
            const pos=fromConnections.indexOf(this.currentConnection);
            fromConnections.splice(pos,1);
            this.currentConnection.path.remove();
            if(this.currentConnection.text){
                this.currentConnection.text.remove();
            }
        }
        this.currentConnection=null;
    }

    _initEvent(){
        event.eventEmitter.on(event.TRIGGER_TOOL,nodeName => {
            if(!this.toolsMap.has(nodeName)){
                throw `Node ${nodeName} not exist.`;
            }
            this.currentTool=this.toolsMap.get(nodeName);
            this.cancelConnection();
        });
        event.eventEmitter.on(event.REMOVE_CLICKED,()=>{
            const selections=[...this.selectionFigures];
            if(selections===0){
                return;
            }
            this.resetSelection();
            selections.forEach((select,index)=>{
                const jsonData=select.toJSON(),uuid=select.uuid,_this=this;
                if(select instanceof Connection){
                    this.addRedoUndo({
                        redo:function () {
                            const conn=_this.getNodeByUUID(uuid);
                            const fromUUID=conn.from.uuid,toUUID=conn.to.uuid;
                            let fromNode=_this.context.getNodeByUUID(fromUUID),toNode=_this.context.getNodeByUUID(toUUID);
                            const newConnection=new Connection(fromNode,{x:fromNode.rect.attr('x'),y:fromNode.rect.attr('y')});
                            fromNode.fromConnections.push(newConnection);
                            toNode.toConnections.push(newConnection);
                            newConnection.to=toNode;
                            newConnection.fromJSON(jsonData);
                        },
                        undo:function () {
                            _this.removeFigureByUUID(uuid);
                        }
                    });
                }else{
                    const tool=select._tool;
                    this.addRedoUndo({
                        redo:function () {
                            _this.removeFigureByUUID(uuid);
                        },
                        undo:function () {
                            const newNode=tool._newNodeInstance(10,10,'');
                            if(newNode){
                                newNode.initFromJson(jsonData);
                                newNode._buildConnections();
                            }
                        }
                    });
                }
                this.removeFigureByUUID(uuid);
            });
        });
        event.eventEmitter.on(event.ALIGN_CENTER,()=>{
            let x=-1,y=-1,w,map=new Map(),index=0;
            for(let select of this.selectionFigures) {
                if (select instanceof Connection) {
                    break;
                }
                let data={oldXY:{x:select.rect.attr('x'),y:select.rect.attr('y')}};
                if(index===0){
                    x=select.rect.attr('x'),w=select.rect.attr('width');
                    x+=w/2;
                }else{
                    select.moveTo(x,y);
                }
                data.newXY={x:select.rect.attr('x'),y:select.rect.attr('y')};
                map.set(select.uuid,data);
                index++;
            }
            const _this=this;
            this.addRedoUndo({
                redo:function () {
                    for(let uuid of map.keys()){
                        let node=_this.getNodeByUUID(uuid),data=map.get(uuid);
                        const {newXY}=data;
                        node.move(newXY.x,newXY.y,node.rect.attr('width'),node.rect.attr('height'));
                    }
                },
                undo:function () {
                    for(let uuid of map.keys()){
                        let node=_this.getNodeByUUID(uuid),data=map.get(uuid);
                        const {oldXY}=data;
                        node.move(oldXY.x,oldXY.y,node.rect.attr('width'),node.rect.attr('height'));
                    }
                }
            });
        });
        event.eventEmitter.on(event.ALIGN_MIDDLE,()=>{
            let x=-1,y=-1,h,map=new Map(),index=0;
            for(let select of this.selectionFigures){
                if(select instanceof Connection){
                    break;
                }
                let data={oldXY:{x:select.rect.attr('x'),y:select.rect.attr('y')}};
                if(index===0){
                    y=select.rect.attr('y'),h=select.rect.attr('height');
                    y+=h/2;
                }else{
                    select.moveTo(x,y);
                }
                data.newXY={x:select.rect.attr('x'),y:select.rect.attr('y')};
                map.set(select.uuid,data);
                index++;
            }
            const _this=this;
            this.addRedoUndo({
                redo:function () {
                    for(let uuid of map.keys()){
                        let node=_this.getNodeByUUID(uuid),data=map.get(uuid);
                        const {newXY}=data;
                        node.move(newXY.x,newXY.y,node.rect.attr('width'),node.rect.attr('height'));
                    }
                },
                undo:function () {
                    for(let uuid of map.keys()){
                        let node=_this.getNodeByUUID(uuid),data=map.get(uuid);
                        const {oldXY}=data;
                        node.move(oldXY.x,oldXY.y,node.rect.attr('width'),node.rect.attr('height'));
                    }
                }
            });
        });
        event.eventEmitter.on(event.UNIFY_SIZE,()=>{
            let w,h,map=new Map(),index=0;
            for(let select of this.selectionFigures) {
                if (select instanceof Connection) {
                    break;
                }
                let data = {oldWH: {w: select.rect.attr('width'), h: select.rect.attr('height')}};
                if(index===0){
                    w=select.rect.attr('width'),h=select.rect.attr('height');
                }else{
                    select.changeSize(w,h);
                }
                data.newWH={w: select.rect.attr('width'), h: select.rect.attr('height')};
                map.set(select.uuid,data);
                index++;
            }
            const _this=this;
            this.addRedoUndo({
                redo:function () {
                    for(let uuid of map.keys()){
                        let node=_this.getNodeByUUID(uuid),data=map.get(uuid);
                        const newWH=data.newWH;
                        node.changeSize(newWH.w,newWH.h);
                    }
                },
                undo:function () {
                    for(let uuid of map.keys()){
                        let node=_this.getNodeByUUID(uuid),data=map.get(uuid);
                        const oldWH=data.oldWH;
                        node.changeSize(oldWH.w,oldWH.h);
                    }
                }
            });
        });
    }

    _initBuiltinTools(){
        this.selectTool=new SelectTool();
        this.connectionTool=new ConnectionTool();
        this.selectTool.context=this;
        this.connectionTool.context=this;
        this.currentTool=this.selectTool;
    }
}
