/**
 * Created by Jacky.gao on 2016/6/28.
 */
import Connection from './Connection.js';
import SelectTool from './tools/SelectTool.js';
import ConnectionTool from './tools/ConnectionTool.js';
export default class Figure{
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
    getText(){
        throw 'Unsupport this method.';
    }
    _createFigure(context,pos){
        if(this.single){
            const text=this.getText();
            let exist=false;
            context.allFigures.forEach((figure,index)=>{
                if(text===figure.getText()){
                    exist=true;
                    return false;
                }
            });
            if(exist)return null;
        }
        this.context=context;
        this.paper=context.paper;
        const w=50,h=80;
        pos={x:pos.x-w/2,y:pos.y-h/2+20};
        this.rect=this.paper.rect(pos.x,pos.y,w,h);
        this.rect.attr({'fill':'#fff','stroke':'#fff','stroke-dasharray':'--'});
        this.context.allFigures.push(this);
        this.svgIconPath=this.getSvgIcon();
        this.icon=this.paper.image(this.svgIconPath,pos.x,pos.y,50,50);

        this.textContent=this.getText();
        const textX=pos.x+w/2,textY=pos.y+h-16;
        this.text=this.paper.text(textX,textY,this.textContent);
        this.text.attr({'font-size':'16pt'});
        this.text.mousedown(function(e){
            e.preventDefault();
        });
        this._initFigure();
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
        this.rect.attr({x,y});
        const textX=x+w/2,textY=y+h-16;
        this.text.attr({x:textX,y:textY});
        const iconX=x-w/2,iconY=y-h/2+20,iconW=this.icon.attr('width'),iconH=this.icon.attr('height');
        this.icon.attr({x:iconX+iconW/2,y:iconY+iconH/2});
        this._resetConnections();
    }

    changeSize(w,h){
        const x=this.rect.attr('x'),y=this.rect.attr('y');
        this.rect.attr({width:w,height:h});
        const textX=x+w/2,textY=y+h-16;
        this.text.attr({x:textX,y:textY});
        const iconW=w,iconH=h-30;
        this.icon.attr({width:iconW,height:iconH});
        this._resetConnections();
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
            var resizeBorder = 3;
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
            const currentTool=context.currentTool;
            if(!currentTool || !(currentTool instanceof ConnectionTool)){
                return;
            }
            var x=e.offsetX;
            var y=e.offsetY;
            var connection=context.currentConnection;
            if(connection){
                if(_this.in===0){
                    return;
                }
                if(_this.in!==-1 && _this.toConnections.length>=_this.in){
                    return;
                }
                connection.endX=x;
                connection.endY=y;
                if(connection.from!==_this){
                    toConnections.push(connection);
                    connection.endPath(_this);
                    context.currentConnection=null;
                }
            }else{
                if(_this.out===0){
                    return;
                }
                if(_this.out!==-1 && _this.fromConnections.length>=_this.out){
                    return;
                }
                connection=new Connection(_this,{endX:x,endY:y});
                context.currentConnection=connection;
                fromConnections.push(connection);
            }
        };
        var mouseClick=function (e) {
            const currentTool=context.currentTool;
            if(!currentTool || !(currentTool instanceof SelectTool)){
                return;
            }
            context.selectFigure(_this);
        };
        this.rect.mouseover(mouseOver);
        this.rect.mousedown(mouseDown);
        this.rect.click(mouseClick);

        this.icon.mouseover(mouseOver);
        this.icon.mousedown(mouseDown);
        this.icon.click(mouseClick);

        var dragStart = function() {
            var rect=_this.rect;
            const currentTool=context.currentTool;
            if(!currentTool || !(currentTool instanceof SelectTool)){
                return;
            }
            context.selectionFigures.forEach((figure,index)=>{
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
            var selectionFigures=context.selectionFigures;
            var rect=_this.rect,icon=_this.icon;
            let x=rect.ox+dx,y=rect.oy+dy;
            if(x<1 || y<1){
                return;
            }
            _this.context.resizePaper(x+100,y+100);
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
        };
        this.rect.drag(dragMove, dragStart, dragEnd);
        this.icon.drag(dragMove, dragStart, dragEnd);
    }

    remove(){
        this.toConnections.forEach((conn,index)=>{
            conn.remove();
        });
        this.fromConnections.forEach((conn,index)=>{
            conn.remove();
        });
        this.text.remove();
        this.icon.remove();
        this.rect.remove();
    }

    _recordRectPosition(){
        this.rect.ox = this.rect.attr('x');
        this.rect.oy = this.rect.attr('y');
    }
    
    _moveRect(dx,dy){
        let x=this.rect.ox+dx,y=this.rect.oy+dy;
        this.rect.attr({
            x,y
        });
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

    getPathInfo(){
        var p1 = this.rect.attr("x");
        var p2 = this.rect.attr("y");
        var p3 = this.rect.attr("x")+this.rect.attr("width");
        var p4 = this.rect.attr("y");
        var p5 = this.rect.attr("x")+this.rect.attr("width");
        var p6 = this.rect.attr("y")+this.rect.attr("height");
        var p7 = this.rect.attr("x");
        var p8 = this.rect.attr("y")+this.rect.attr("height");
        return "M "+p1+" "+p2+" L "+p3+" "+p4+" L "+p5+" "+p6+" L "+p7+"  "+p8+" L "+p1+"  "+p2+"";
    }
}