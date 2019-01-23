/**
 * Created by Jacky.gao on 2016/6/28.
 */
import Connection from './Connection.js';
import SelectTool from './tools/SelectTool.js';
import ConnectionTool from './tools/ConnectionTool.js';
import * as MsgBox from './MsgBox.js';
export default class Node{
    constructor(config={}){
        this.fromConnections=[];
        this.toConnections=[];
    }
    _initConfigs(config){
        this.in=config.in;
        if(!this.in && this.in!==0){
            this.in=-1;//-1 is unlimited
        }
        this.out=config.out;
        if(!this.out && this.out!==0){
            this.out=-1;
        }
        this.single=config.single;//Whether the current instance can have more then one
    }
    getSvgIcon(){
        throw 'Unsupport this method.';
    }

    validate(){
        return null;
    }

    initFromJson(json){
        let {x,y,name,connections}=json;
        let width=json.width || json.w,height=json.height || json.h;
        x=parseInt(x),y=parseInt(y),width=parseInt(width),height=parseInt(height);
        this.changeSize(width,height);
        this.move(x,y,width,height);
        this.name=name;
        this.text.attr('text',name);
        if(json.uuid){
            this.uuid=json.uuid;
        }
        this.connections=json.connections;
        this.fromConnectionsJson=json.fromConnections;
        this.toConnectionsJson=json.toConnections;
    }

    _buildConnections(){
        if(this.fromConnectionsJson){
            for(let json of this.fromConnectionsJson){
                let toNodeUUID=json.toUUID,fromNodeUUID=json.fromUUID;
                const toNode=this.context.getNodeByUUID(toNodeUUID),fromNode=this.context.getNodeByUUID(fromNodeUUID);
                const newConnection=new Connection(fromNode,{endX:0,endY:0});
                newConnection.fromJSON(json);
                newConnection.endPath(toNode);
            }
        }
        if(this.toConnectionsJson){
            for(let json of this.toConnectionsJson){
                let toNodeUUID=json.toUUID,fromNodeUUID=json.fromUUID;
                const toNode=this.context.getNodeByUUID(toNodeUUID),fromNode=this.context.getNodeByUUID(fromNodeUUID);
                const newConnection=new Connection(fromNode,{endX:0,endY:0});
                newConnection.fromJSON(json);
                newConnection.endPath(toNode);
            }
        }
        if(this.connections){
            for(let json of this.connections){
                let fromNode=this,to=json.to,toNode=null;
                for(let figure of this.context.allFigures){
                    if(figure instanceof Connection){
                        continue;
                    }
                    if(figure.name===to){
                        toNode=figure;
                        break;
                    }
                }
                if(!toNode){
                    MsgBox.alert(`连线的目标节点${to}不存在`);
                    return;
                }
                const newConnection=new Connection(fromNode,{endX:0,endY:0});
                newConnection.endPath(toNode);
                newConnection.fromJSON(json);
            }
        }
    }

    toJSON(){
        return this.nodeToJSON();
    }

    nodeToJSON(){
        let json={
            x:this.rect.attr('x'),
            y:this.rect.attr('y'),
            w:this.rect.attr('width'),
            h:this.rect.attr('height'),
            name:this.name,
            uuid:this.uuid
        };
        const fromConnections=[],toConnections=[];
        this.fromConnections.forEach((conn,index)=>{
            fromConnections.push(conn.toJSON());
        });
        this.toConnections.forEach((conn,index)=>{
            toConnections.push(conn.toJSON());
        });
        json.fromConnections=fromConnections;
        json.toConnections=toConnections;
        return json;
    }

    _createFigure(context,pos,name){
        if(this.single){
            let exist=false;
            for(let figure of context.allFigures){
                if(figure instanceof this.constructor){
                    exist=true;
                    break;
                }
            }
            if(exist){
                MsgBox.alert('当前节点只允许创建一个.');
                return false;
            }
        }
        this.uuid=context.nextUUID();
        this.context=context;
        this.paper=context.paper;
        const w=40,h=70;
        pos={x:pos.x-w/2,y:pos.y-h/2+15};
        this.rect=this.paper.rect(pos.x,pos.y,w,h);
        this.rect.attr({'fill':'#fff','stroke':'#fff','stroke-dasharray':'--'});
        this.context.allFigures.push(this);
        this.svgIconPath=this.getSvgIcon();
        this.icon=this.paper.image(this.svgIconPath,pos.x,pos.y,40,40);
        this.name=name;
        const textX=pos.x+w/2,textY=pos.y+h-16;
        this.text=this.paper.text(textX,textY,this.name);
        this.text.attr({'font-size':'16pt'});
        this.text.mousedown(function(e){
            e.preventDefault();
        });
        this._initFigure();
        return true;
    }

    moveTo(centerX,centerY){
        const w=this.rect.attr('width'),h=this.rect.attr('height');
        let x,y;
        if(centerX===-1){
            x=this.rect.attr('x');
            y=centerY-h/2;
        }
        if(centerY===-1){
            y=this.rect.attr('y');
            x=centerX-w/2;
        }
        this.move(x,y,w,h);
    }

    move(x,y,w,h){
        this.rect.attr({x,y});
        const textX=x+w/2,textY=y+h-16;
        this.text.attr({x:textX,y:textY});
        const iconX=x-w/2,iconY=y-h/2+20,iconW=this.icon.attr('width'),iconH=this.icon.attr('height');
        this.icon.attr({x:iconX+iconW/2,y:iconY+iconH/2});
        this._resetConnections();
        if(window._setDirty){
            window._setDirty();
        }
    }

    changeSize(w,h){
        const x=this.rect.attr('x'),y=this.rect.attr('y');
        this.rect.attr({width:w,height:h});
        const textX=x+w/2,textY=y+h-16;
        this.text.attr({x:textX,y:textY});
        const iconW=w,iconH=h-30;
        this.icon.attr({width:iconW,height:iconH});
        this._resetConnections();
        if(window._setDirty){
            window._setDirty();
        }
    }

    _initFigure(){
        var context=this.context;
        var fromConnections=this.fromConnections;
        var toConnections=this.toConnections;
        var _this=this;
        var mouseOver=function (e,mouseX,mouseY) {
            if (this.dragging === true) {
                return;
            }
            const currentTool=context.currentTool;
            if(!currentTool){
                return;
            }
            if(currentTool instanceof ConnectionTool){
                this.attr('cursor', 'pointer');
            }
            if(!(currentTool instanceof SelectTool)){
                return;
            }
            var container=context.container;
            var relativeX = mouseX - container.offset().left - this.attr('x');
            var relativeY = mouseY - container.offset().top - this.attr('y');
            var shapeWidth = this.attr('width');
            var shapeHeight = this.attr('height');
            var resizeBorder = 5;
            // Change cursor
            if (relativeX < resizeBorder && relativeY < resizeBorder) {
                this.attr('cursor', 'nw-resize');
            } else if (relativeX > shapeWidth-resizeBorder && relativeY < resizeBorder) {
                this.attr('cursor', 'ne-resize');
            } else if (relativeX > shapeWidth-resizeBorder && relativeY > shapeHeight-resizeBorder) {
                this.attr('cursor', 'se-resize');
            } else if (relativeX < resizeBorder && relativeY > shapeHeight-resizeBorder) {
                this.attr('cursor', 'sw-resize');
            } else {
                this.attr('cursor', 'move');
            }
        };

        var mouseDown=function (e) {
            if(this.dragging){
                return;
            }
            let currentTool=context.currentTool;
            if(!currentTool){
                return;
            }
            if(!(currentTool instanceof ConnectionTool)){
                if(!(currentTool instanceof SelectTool)){
                    context.currentTool=context.selectTool;
                    currentTool=context.currentTool;
                    context.flowDesigner.nodeToolbar.children('label').removeClass('active');
                }
            }
            if(currentTool instanceof SelectTool){
                if(context.selectionFigures.length===0){
                    context.selectFigure(_this);
                }else{
                    let contain=false;
                    for(let figure of context.selectionFigures){
                        if(figure===_this){
                            contain=true;
                            break;
                        }
                    }
                    if(!contain){
                        context.resetSelection();
                        context.selectFigure(_this);
                    }
                }
            }

            if(!(currentTool instanceof ConnectionTool)){
                return;
            }
            var x=e.offsetX;
            var y=e.offsetY;
            var connection=context.currentConnection;
            if(connection){
                if(_this.in===0){
                    MsgBox.alert(`当前节点不允许有进入的连线.`);
                    return;
                }
                if(_this.in!==-1 && _this.toConnections.length>=_this.in){
                    MsgBox.alert(`当前节点进入的连线最多只能有${_this.in}条.`);
                    return;
                }
                connection.endX=x;
                connection.endY=y;
                if(connection.from!==_this){
                    connection.endPath(_this);
                    context.currentConnection=null;
                    const fromUUID=connection.from.uuid,toUUID=_this.uuid,uuid=connection.uuid;
                    context.addRedoUndo({
                        redo:function () {
                            const from=context.getNodeByUUID(fromUUID),to=context.getNodeByUUID(toUUID);
                            connection=new Connection(from,{endX:from.rect.attr('x'),endY:from.rect.attr('y')});
                            connection.uuid=uuid;
                            connection.endPath(to);
                        },
                        undo:function () {
                            _this.context.removeFigureByUUID(uuid);
                        }
                    })
                }else{
                    MsgBox.alert('连线的起始节点不能为同一节点.');
                }
            }else{
                if(_this.out===0){
                    MsgBox.alert('当前节点不允许有出去的连线.');
                    return;
                }
                if(_this.out!==-1 && _this.fromConnections.length>=_this.out){
                    MsgBox.alert(`当前节点出去的连线最多只能有${_this.out}条.`);
                    return;
                }
                connection=new Connection(_this,{endX:x,endY:y});
                context.currentConnection=connection;
            }
        };
        this.rect.mouseover(mouseOver);
        this.rect.mousedown(mouseDown);
        this.icon.mouseover(mouseOver);
        this.icon.mousedown(mouseDown);

        var dragStart = function() {
            var rect=_this.rect;
            const currentTool=context.currentTool;
            if(!currentTool || !(currentTool instanceof SelectTool)){
                return;
            }
            let contain=false;
            const selectionFigures=context.selectionFigures;
            for(let figure of selectionFigures){
                if(figure===_this){
                    contain=true;
                    break;
                }
            }
            if(!contain){
                context.resetSelection();
                return;
            }
            selectionFigures.forEach((figure,index)=>{
                if(!(figure instanceof Connection)){
                    figure._recordRectPosition();
                }
            });
            rect.ow = rect.attr('width');
            rect.oh = rect.attr('height');
            rect.dragging = true;
        };

        var dragMove = function(dx, dy) {
            const currentTool=context.currentTool;
            if(!currentTool || !(currentTool instanceof SelectTool)){
                return;
            }
            if(_this.context.snapto){
                dx-=dx%10,dy-=dy%10;
            }
            const selectionFigures=context.selectionFigures;
            const rect=_this.rect,icon=_this.icon;
            let x=rect.ox+dx,y=rect.oy+dy;
            if(x<1 || y<1){
                return;
            }
            _this.context.resizePaper(x+150,y+150);
            let width,height;
            switch (this.attr('cursor')) {
                case 'nw-resize' :
                    width=rect.ow - dx,height=rect.oh - dy;
                    if(width>20 && height>20){
                        rect.attr({
                            x,
                            y,
                            width,
                            height
                        });
                    }
                    break;
                case 'ne-resize' :
                    width=rect.ow + dx,height=rect.oh - dy;
                    if(width>20 && height>20){
                        rect.attr({
                            y,
                            width,
                            height
                        });
                    }

                    break;
                case 'se-resize' :
                    width=rect.ow + dx,height=rect.oh + dy;
                    if(width>20 && height>20){
                        rect.attr({
                            width,
                            height
                        });
                    }
                    break;
                case 'sw-resize' :
                    width=rect.ow - dx,height=rect.oh + dy;
                    if(width>20 && height>20){
                        rect.attr({
                            x,
                            width,
                            height
                        });
                    }
                    break;
                default :
                    selectionFigures.forEach((figure,index)=>{
                        if(!(figure instanceof Connection)){
                            figure._moveRect(dx,dy)
                        }
                    });
                    break;
            }
            selectionFigures.forEach((figure,index)=>{
                if(!(figure instanceof Connection)){
                    figure._moveAndResizeTextAndIcon();
                    figure._resetConnections();
                }
            });
        };
        var dragEnd = function() {
            _this.rect.dragging = false;
            const selectionUUIDs=[],xyMap=new Map(),oldXYMap=new Map(),ow=_this.rect.ow,oh=_this.rect.oh,w=_this.rect.attr('width'),h=_this.rect.attr('height'),nodeUUID=_this.uuid;
            for(const figure of context.selectionFigures){
                if(!(figure instanceof Connection)){
                    selectionUUIDs.push(figure.uuid);
                    let ox=figure.rect.ox,oy=figure.rect.oy;
                    ox=ox ? ox : 0,oy=oy ? oy : 0;
                    const x=figure.rect.attr('x'),y=figure.rect.attr('y');
                    xyMap.set(figure.uuid,{x,y});
                    oldXYMap.set(figure.uuid,{x:ox,y:oy});
                }
            }
            _this.context.addRedoUndo({
                redo:function () {
                    for(const uuid of selectionUUIDs){
                        const node=context.getNodeByUUID(uuid);
                        const pos=xyMap.get(uuid);
                        node.rect.attr({x:pos.x,y:pos.y});
                        if(uuid===nodeUUID){
                            node.rect.attr({width:w,height:h});
                        }
                    }
                    for(const uuid of selectionUUIDs){
                        const node=context.getNodeByUUID(uuid);
                        node._moveAndResizeTextAndIcon();
                        node._resetConnections();
                    }
                },
                undo:function () {
                    for(const uuid of selectionUUIDs){
                        const node=context.getNodeByUUID(uuid);
                        const pos=oldXYMap.get(uuid);
                        node.rect.attr({x:pos.x,y:pos.y});
                        if(uuid===nodeUUID){
                            node.rect.attr({width:ow,height:oh});
                        }
                    }
                    for(const uuid of selectionUUIDs){
                        const node=context.getNodeByUUID(uuid);
                        node._moveAndResizeTextAndIcon();
                        node._resetConnections();
                    }
                }
            });
            if(window._setDirty){
                window._setDirty();
            }
        };
        this.rect.drag(dragMove, dragStart, dragEnd);
        this.icon.drag(dragMove, dragStart, dragEnd);
    }

    remove(){
        const toConnections=[...this.toConnections],fromConnections=[...this.fromConnections];
        toConnections.forEach((conn,index)=>{
            this.context.removeFigureByUUID(conn.uuid);
        });
        fromConnections.forEach((conn,index)=>{
            this.context.removeFigureByUUID(conn.uuid);
        });
        this.text.remove();
        this.icon.remove();
        this.rect.remove();
        if(window._setDirty){
            window._setDirty();
        }
    }

    _recordRectPosition(){
        this.rect.ox = this.rect.attr('x');
        this.rect.oy = this.rect.attr('y');
    }

    _moveRect(dx,dy){
        let x,y;
        if(this.rect.ox && this.rect.ox!==0){
            x=this.rect.ox+dx,y=this.rect.oy+dy;
        }else{
            x=this.rect.attr('x')+dx,y=this.rect.attr('x')+dy;
        }
        this.rect.attr({x,y});
    }

    _moveAndResizeTextAndIcon(){
        var rectWidth=this.rect.attr('width'),rectHeight=this.rect.attr('height');
        this.text.attr({x:this.rect.attr('x')+rectWidth/2,y:this.rect.attr('y')+rectHeight-16});
        this.icon.attr({x:this.rect.attr('x'),y:this.rect.attr('y'),width:rectWidth,height:rectHeight-30});
    }

    _resetConnections(){
        const conns=[...this.fromConnections,...this.toConnections];
        conns.forEach((conn,index)=>{
            conn.updatePath();
        });
    }

    getPathInfo(forIntersection){
        let x=this.rect.attr("x"),y=this.rect.attr("y"),w=this.rect.attr("width"),h=this.rect.attr("height");
        if(forIntersection){
            x-=5,y-=5,w+=10,h+=10;
        }
        return "M "+x+" "+y+" L "+(x+w)+" "+y+" L "+(x+w)+" "+(y+h)+" L "+x+"  "+(y+h)+" L "+x+"  "+y;
    }
}