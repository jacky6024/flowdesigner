/**
 * Created by Jacky.gao on 2016/6/28.
 */
import Raphael from 'raphael';
import SelectTool from './tools/SelectTool.js';
import ConnectionTool from './tools/ConnectionTool.js';
import Connection from './Connection.js';

export default class Canvas{
    constructor(context){
        this.context=context;
        this._init();
    }
    
    _init(){
        let selectionBox=null;
        const context=this.context,paper=context.paper;
        let selections=paper.set();
        this.canvas=paper.rect(0,0,paper.width, paper.height).attr({"fill":"#FFF",opacity:0});
        this.canvas.toBack();
        this.canvas.drag(dragMove,dragStart,dragEnd);

        this.canvas.click(function (e) {
            const currentTool=context.currentTool;
            if(!currentTool || currentTool instanceof ConnectionTool || currentTool instanceof SelectTool){
                return;
            }
            const x=e.offsetX,y=e.offsetY;
            let newNode=currentTool._newNodeInstance(x,y);
            if(newNode){
                const uuid=newNode.uuid,name=newNode.name,jsonData=newNode.toJSON();
                context.addRedoUndo({
                    redo:function () {
                        newNode=currentTool._newNodeInstance(x,y,name);
                        newNode.initFromJson(jsonData);
                    },
                    undo:function () {
                        context.removeFigureByUUID(uuid);
                    }
                });
            }
        });

        this.canvas.mousemove(function (e) {
            if(!context.currentTool){
                return;
            }
            if(!(context.currentTool instanceof ConnectionTool)){
                return;
            }
            const connection=context.currentConnection;
            if(!connection){
                return;
            }
            const x=e.offsetX,y=e.offsetY;
            connection.endX=x;
            connection.endY=y;
            connection.updatePath();
        });

        function dragStart (x, y, event) {
            const currentTool=context.currentTool;
            if(!currentTool || !(currentTool instanceof SelectTool)){
                return;
            }
            selectionBox = paper.rect(event.offsetX, event.offsetY, 0, 0).attr("stroke", "#9999FF");
        }

        function dragMove (dx, dy, x, y, event) {
            const currentTool=context.currentTool;
            if(!currentTool || !(currentTool instanceof SelectTool)){
                return;
            }
            let offsetX = 0,offsetY = 0;
            if (dx < 0) {
                offsetX = dx;
                dx = -1 * dx;
            }
            if (dy < 0) {
                offsetY = dy;
                dy = -1 * dy;
            }
            selectionBox.transform("T" + offsetX + "," + offsetY);
            selectionBox.attr("width", dx);
            selectionBox.attr("height", dy);
        }

        function dragEnd (event) {
            const currentTool=context.currentTool;
            if(!currentTool || !(currentTool instanceof SelectTool)){
                return;
            }
            const bounds = selectionBox.getBBox();
            selectionBox.remove();
            context.startSelect();
            const allFigures=context.allFigures;
            let connectionSelections=[],figureSelections=[];
            for (let i=0 ;i < allFigures.length; i++) {
                let figure=allFigures[i];
                if(figure instanceof Connection){
                    let selectionPath='M'+bounds.x+' '+bounds.y+ ' L'+(bounds.x+bounds.width)+' '+bounds.y+' L'+(bounds.x+bounds.width)+' '+(bounds.y+bounds.height)+' L'+bounds.x+' '+(bounds.y+bounds.height)+' L'+bounds.x+' '+bounds.y;
                    let figurePath=figure.path.attr('path');
                    let dot=Raphael.pathIntersection(figurePath,selectionPath);
                    if(dot.length>0){
                        connectionSelections.push(figure);
                    }
                }else{
                    let element=figure.rect;
                    let figureBounds = element.getBBox();
                    if (figureBounds.x >= bounds.x && figureBounds.x <= bounds.x2 || figureBounds.x2 >= bounds.x && figureBounds.x2 <= bounds.x2) {
                        if (figureBounds.y >= bounds.y && figureBounds.y <= bounds.y2 || figureBounds.y2 >= bounds.y && figureBounds.y2 <= bounds.y2) {
                            figureSelections.push(figure);
                        }
                    }
                }
            }
            if(figureSelections.length>0){
                figureSelections.forEach((figure,i)=>{
                    context.addSelection(figure);
                })
            }else{
                connectionSelections.forEach((conn,i)=>{
                    context.addSelection(conn);
                })
            }
            context.endSelect();
            if(window._setDirty){
                window._setDirty();
            }
        }
    }
};



