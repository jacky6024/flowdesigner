/**
 * Created by Jacky.gao on 2016/6/29.
 */
import Canvas from './Canvas.js';
import Context from './Context.js';
import * as event from './event.js';
import Figure from './Figure.js';
import Connection from './Connection.js';

export default class Editor{
    constructor(containerId){
        const container=$('#'+containerId);
        this.toolbar=$(`<div class="btn-group" data-toggle="buttons" style="border:solid 1px #dddddd;width:100%;background: #fff"></div>`);
        container.append(this.toolbar);

        this.canvasContainer=$(`<div style="border:solid 1px #eee;height: 600px;background-color: #ffffff;"></div>`);
        container.append(this.canvasContainer);
        this.context=new Context(this.canvasContainer);
        this.canvas=new Canvas(this.context);

        const propContainerId='_prop_container';
        const propertyPanel=$('<div style="width: 300px;border: solid 1px #999;border-radius: 5px;top:100px;left:800px;background: #ffffff;box-shadow: 5px 5px 5px #888888;position: absolute"/>');
        this.canvasContainer.append(propertyPanel);

        const propertyTab=$(`<ul class="nav nav-tabs">
            <li class="active">
                <a href="${propContainerId}" data-toggle="tab">属性面板</a>
            </li>
        </ul>`);
        propertyPanel.append(propertyTab);
        propertyTab.mousedown(function (e) {
           e.preventDefault();
        });
        this.propContainer=$(`<div id="${propContainerId}"/>`);
        const tabContent=$(`<div class="tab-content" style="min-height: 200px;padding:10px"/>`);
        tabContent.append(this.propContainer);
        propertyPanel.append(tabContent);
        propertyPanel.mousedown(function (e) {
            this.dragging=true;
            var event = e || window.event;
            this.mX = event.clientX;
            this.mY = event.clientY;
            const offset=$(this).offset();
            this.dX = offset.left;
            this.dY = offset.top;
        });
        propertyPanel.mousemove(function (e) {
            if(!this.dragging){
                return;
            }
            const event = e || window.event;
            const x = event.clientX, y = event.clientY;
            $(this).css({left:x-this.mX+this.dX,top:y-this.mY+this.dY});
        });
        propertyPanel.mouseup(function (e) {
            this.dragging=false;
        });
        this._bindSnapToEvent();
    }

    _bindSnapToEvent(){
        event.eventEmitter.on(event.SNAPTO_SELECTED,()=>{
            if(this.canvasContainer.css('background-image')==='none'){
                this.canvasContainer.css({'background-image': 'url(../icon/grid-bg.png)'});
                this.context.snapto=true;
            }else{
                this.canvasContainer.css({'background-image': 'none'});
                this.context.snapto=false;
            }
        });
    }
    
    buildEditor(){
        this._buildTools();
        this._bindSelectionEvent();
    }

    _buildTools(){
        for(let figure of this.context.toolsMap.values()){
            let tools=$(`
                <label class="btn btn-default" style="border:none;border-radius:0">
                    <input type="radio" name="tools" title="${figure.getName()}"> ${figure.getIcon()}
                </label>
            `);
            this.toolbar.append(tools);
            tools.click(function () {
                event.eventEmitter.emit(event.TRIGGER_TOOL,figure.getName());
            });
        };
        const snapTool=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
            <i class="iconfont icon-snapto" style="color:#737383"></i>
        </button>`);
        this.toolbar.append(snapTool);
        snapTool.click(function (e) {
            event.eventEmitter.emit(event.SNAPTO_SELECTED);
        });
        const removeTool=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
            <i class="iconfont icon-delete" style="color:#737383"></i>
        </button>`);
        this.toolbar.append(removeTool);
        removeTool.click(function (e) {
            event.eventEmitter.emit(event.REMOVE_CLICKED);
        });
        const alignCenter=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
             <i class="iconfont icon-align-center"></i>
        </button>`);
        this.toolbar.append(alignCenter);
        alignCenter.click(function (e) {
            event.eventEmitter.emit(event.ALIGN_CENTER);
        });
        const alignMiddle=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
             <i class="iconfont icon-align-middle"></i>
        </button>`);
        this.toolbar.append(alignMiddle);
        alignMiddle.click(function (e) {
            event.eventEmitter.emit(event.ALIGN_MIDDLE);
        });
        const sameSize=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
             <i class="iconfont icon-samesize"></i>
        </button>`);
        this.toolbar.append(sameSize);
        sameSize.click(function (e) {
            event.eventEmitter.emit(event.UNIFY_SIZE);
        });
    }

    _bindSelectionEvent(){
        const _this=this;
        event.eventEmitter.on(event.OBJECT_SELECTED,target=>{
            this.propContainer.empty();
            if(target instanceof Figure){
                const nameGroup=$(`<div class="form-group"><label>节点名称</label></div>`);
                const nameText=$(`<input type="text" class="form-control" value="${target.text.attr('text')}">`);
                nameGroup.append(nameText);
                this.propContainer.append(nameGroup);
                nameText.change(function(e){
                    target.text.attr('text',$(this).val());
                });
                this.propContainer.append(target._tool.getPropertyContainer());
            }else if(target instanceof Connection){
                const nameGroup=$(`<div class="form-group"><label>连线名称</label></div>`);
                const nameText=$(`<input type="text" class="form-control" value="${target.name ? target.name : ''}">`);
                nameGroup.append(nameText);
                this.propContainer.append(nameGroup);
                nameText.change(function(e){
                    target.name=$(this).val();
                    target._buildText();
                });
                const lineTypeGroup=$(`<div class="form-group"><label>线型</label></div>`);
                const typeSelect=$(`<select class="form-control">
                    <option value="line">直线</option>
                    <option value="curve">直角曲线</option>
                </select>`);
                lineTypeGroup.append(typeSelect);
                typeSelect.val(target.type);
                typeSelect.change(function(e){
                    target.type=$(this).val();
                    target.updatePath();
                    _this.context.resetSelection();
                });
                this.propContainer.append(lineTypeGroup);
                this.propContainer.append(target.from._tool.getOutConnectionPropertyContainer());
                this.propContainer.append(target.to._tool.getInConnectionPropertyContainer());
            }
        });
        event.eventEmitter.on(event.CANVAS_SELECTED,()=>{
            this.propContainer.empty();
        });
    }

    addFigure(figure){
        this.context.registerFigure(figure);
        return this;
    }
}


