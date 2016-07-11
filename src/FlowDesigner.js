/**
 * Created by Jacky.gao on 2016/6/29.
 */
import '../css/iconfont.css';
import '../css/flowdesigner.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import {} from 'bootstrap';
import Canvas from './Canvas.js';
import Context from './Context.js';
import * as event from './event.js';
import Node from './Node.js';
import Connection from './Connection.js';
import * as MsgBox from './MsgBox.js';

export default class FlowDesigner{
    constructor(containerId){
        const container=$('#'+containerId);
        this.toolbar=$(`<div class="btn-group fd-toolbar" data-toggle="buttons"></div>`);
        container.append(this.toolbar);

        this.canvasContainer=$(`<div class="fd-canvas-container"></div>`);
        container.append(this.canvasContainer);
        this.context=new Context(this.canvasContainer);
        this.canvas=new Canvas(this.context);

        const propContainerId='_prop_container';
        const propertyPanel=$('<div class="fd-property-panel"/>');
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
            if(this.canvasContainer.hasClass('snaptogrid')){
                this.canvasContainer.removeClass('snaptogrid');
                this.canvasContainer.addClass('nosnaptogrid');
                this.context.snapto=false;
            }else{
                this.canvasContainer.removeClass('nosnaptogrid');
                this.canvasContainer.addClass('snaptogrid');
                this.context.snapto=true;
            }
        });
    }

    buildDesigner(){
        this._buildTools();
        this._bindSelectionEvent();
    }

    getPropertyContainer(){
        return '<div/>';
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
            <i class="fd fd-snapto" style="color:#737383"></i>
        </button>`);
        this.toolbar.append(snapTool);
        snapTool.click(function (e) {
            event.eventEmitter.emit(event.SNAPTO_SELECTED);
        });
        const removeTool=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
            <i class="fd fd-delete" style="color:#737383"></i>
        </button>`);
        this.toolbar.append(removeTool);
        removeTool.click(function (e) {
            event.eventEmitter.emit(event.REMOVE_CLICKED);
        });
        const alignCenter=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
             <i class="fd fd-align-center"></i>
        </button>`);
        this.toolbar.append(alignCenter);
        alignCenter.click(function (e) {
            event.eventEmitter.emit(event.ALIGN_CENTER);
        });
        const alignMiddle=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
             <i class="fd fd-align-middle"></i>
        </button>`);
        this.toolbar.append(alignMiddle);
        alignMiddle.click(function (e) {
            event.eventEmitter.emit(event.ALIGN_MIDDLE);
        });
        const sameSize=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
             <i class="fd fd-samesize"></i>
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
            if(target instanceof Node){
                const nameGroup=$(`<div class="form-group"><label>节点名称</label></div>`);
                const nameText=$(`<input type="text" class="form-control" value="${target.text.attr('text')}">`);
                nameGroup.append(nameText);
                this.propContainer.append(nameGroup);
                nameText.change(function(e){
                    target.name=$(this).val();
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
                this.propContainer.append(target.from._tool.getConnectionPropertyContainer());
            }
        });
        event.eventEmitter.on(event.CANVAS_SELECTED,()=>{
            this.propContainer.empty();
            this.propContainer.append(this.getPropertyContainer());
        });
    }

    addTool(tool){
        tool.context=this.context;
        this.context.registerTool(tool);
        return this;
    }
    toJSON(){
        return this.elementsToJSON();
    }
    elementsToJSON(){
        let errors=[];
        this.context.allFigures.forEach((figure,index)=>{
            if(figure instanceof Node){
                const errorInfo=figure.validate();
                if(errorInfo){
                    errors.push(errorInfo);
                }
            }
        });
        if(errors.length>0){
            let info='';
            errors.forEach((error,index)=>{
                info+=(index+1)+'.'+error+'<br>';
            });
            info='<span style="color:orangered">错误：<br>'+info+'</span>';
            MsgBox.alert(info);
            return null;
        }
        const startNodes=[];
        this.context.allFigures.forEach((figure,index)=>{
            if(figure instanceof Node){
                if(figure.toConnections===0){
                    startNodes.push(figure);
                }
            }
        });
        if(startNodes.length===0){
            MsgBox.alert('未发现起始节点，不能保存.');
            return;
        }
        if(startNodes.length===1){
            const json=startNodes[0].toJSON();
            return json;
        }else{
            const json=[];
            startNodes.forEach((node,index)=>{
                json.push(node.toJSON());
            });
            return json;
        }
    }
}


