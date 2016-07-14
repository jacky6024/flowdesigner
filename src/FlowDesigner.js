/**
 * Created by Jacky.gao on 2016/6/29.
 */
import '../css/iconfont.css';
import '../css/flowdesigner.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import {} from 'bootstrap';
import {} from './jquery.draggable.js';
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
        this.nodeToolbar=$(`<div class="btn-group fd-node-toolbar" data-toggle="buttons"></div>`);
        container.append(this.nodeToolbar);

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
        propertyPanel.draggable();
        this._bindSnapToEvent();
        this._bindShortcutKey();
    }

    _bindShortcutKey(){
        const _this=this;
        let isCtrl=false;
        $(document).keydown(function (e) {
            if(e.which===17){
                isCtrl=true;
            }
            if(!isCtrl){
                return;
            }
            if(e.which===90){
                _this.context.undoManager.undo();
            }else if(e.which===89){
                _this.context.undoManager.redo();
            }
        }).keyup(function (e) {
            if(e.which===17){
                isCtrl=false;
            }
        });
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
        const context=this.context,_this=this;
        const selectTool=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
            <i class="fd fd-select" style="color:#737383"></i>
        </button>`);
        this.toolbar.append(selectTool);
        selectTool.click(function (e) {
            context.cancelConnection();
            context.currentTool=context.selectTool;
            _this.nodeToolbar.children('label').removeClass('active');
        });
        const connectionTool=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
            <i class="fd fd-line" style="color:#737383"></i>
        </button>`);
        this.toolbar.append(connectionTool);
        connectionTool.click(function (e) {
            context.cancelConnection();
            context.currentTool=context.connectionTool;
            _this.nodeToolbar.children('label').removeClass('active');
        });
        const undoTool=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
            <i class="fd fd-undo" style="color:#737383"></i>
        </button>`);
        this.toolbar.append(undoTool);
        undoTool.click(function (e) {
            context.cancelConnection();
            context.undoManager.undo();
            _this.nodeToolbar.children('label').removeClass('active');
            context.currentTool=context.selectTool;
        });
        const redoTool=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
            <i class="fd fd-redo" style="color:#737383"></i>
        </button>`);
        this.toolbar.append(redoTool);
        redoTool.click(function (e) {
            context.cancelConnection();
            context.undoManager.redo();
            _this.nodeToolbar.children('label').removeClass('active');
            context.currentTool=context.selectTool;
        });

        const snapTool=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
            <i class="fd fd-snapto" style="color:#737383"></i>
        </button>`);
        this.toolbar.append(snapTool);
        snapTool.click(function (e) {
            context.cancelConnection();
            event.eventEmitter.emit(event.SNAPTO_SELECTED);
            _this.nodeToolbar.children('label').removeClass('active');
            context.currentTool=context.selectTool;
        });
        const removeTool=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
            <i class="fd fd-delete" style="color:#737383"></i>
        </button>`);
        this.toolbar.append(removeTool);
        removeTool.click(function (e) {
            context.cancelConnection();
            event.eventEmitter.emit(event.REMOVE_CLICKED);
            _this.nodeToolbar.children('label').removeClass('active');
            context.currentTool=context.selectTool;
        });
        const alignCenter=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
             <i class="fd fd-align-center"></i>
        </button>`);
        this.toolbar.append(alignCenter);
        alignCenter.click(function (e) {
            context.cancelConnection();
            event.eventEmitter.emit(event.ALIGN_CENTER);
            _this.nodeToolbar.children('label').removeClass('active');
            context.currentTool=context.selectTool;
        });
        const alignMiddle=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
             <i class="fd fd-align-middle"></i>
        </button>`);
        this.toolbar.append(alignMiddle);
        alignMiddle.click(function (e) {
            context.cancelConnection();
            event.eventEmitter.emit(event.ALIGN_MIDDLE);
            _this.nodeToolbar.children('label').removeClass('active');
            context.currentTool=context.selectTool;
        });
        const sameSize=$(`<button type="button" class="btn btn-default" style="border:none;border-radius:0">
             <i class="fd fd-samesize"></i>
        </button>`);
        this.toolbar.append(sameSize);
        sameSize.click(function (e) {
            context.cancelConnection();
            event.eventEmitter.emit(event.UNIFY_SIZE);
            _this.nodeToolbar.children('label').removeClass('active');
            context.currentTool=context.selectTool;
        });
        this._buildNodeTools();
    }

    _buildNodeTools(){
        for(let tool of this.context.toolsMap.values()){
            let tools=$(`
                <label class="btn btn-default" style="border:none;border-radius:0">
                    <input type="radio" name="tools" title="${tool.getName()}"> ${tool.getIcon()}
                </label>
            `);
            this.nodeToolbar.append(tools);
            tools.click(function () {
                event.eventEmitter.emit(event.TRIGGER_TOOL,tool.getName());
            });
        };
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
                    const newName=$(this).val(),oldName=target.name,uuid=target.uuid;
                    target.name=newName;
                    target.text.attr('text',$(this).val());
                    _this.context.addRedoUndo({
                        redo:function () {
                            const node=_this.context.getNodeByUUID(uuid);
                            node.name=newName;
                            node.text.attr('text',newName);
                        },
                        undo:function () {
                            const node=_this.context.getNodeByUUID(uuid);
                            node.name=oldName;
                            node.text.attr('text',oldName);
                        }
                    })
                });
                this.propContainer.append(target._tool.getPropertyContainer());
            }else if(target instanceof Connection){
                const nameGroup=$(`<div class="form-group"><label>连线名称</label></div>`);
                const nameText=$(`<input type="text" class="form-control" value="${target.name ? target.name : ''}">`);
                nameGroup.append(nameText);
                this.propContainer.append(nameGroup);
                nameText.change(function(e){
                    const newName=$(this).val(),oldName=target.name,uuid=target.uuid;
                    target.name=newName;
                    target._buildText();
                    _this.context.addRedoUndo({
                        redo:function () {
                            const node=_this.context.getNodeByUUID(uuid);
                            node.name=newName;
                            node._buildText();
                        },
                        undo:function () {
                            const node=_this.context.getNodeByUUID(uuid);
                            node.name=oldName;
                            node._buildText();
                        }
                    });
                });

                const lineTypeGroup=$(`<div class="form-group"><label>线型</label></div>`);
                const typeSelect=$(`<select class="form-control">
                    <option value="line">直线</option>
                    <option value="curve">直角曲线</option>
                </select>`);
                lineTypeGroup.append(typeSelect);
                typeSelect.val(target.type);
                typeSelect.change(function(e){
                    const type=$(this).val(),uuid=target.uuid,oldType=target.type;
                    target.type=type;
                    target.updatePath();
                    _this.context.resetSelection();
                    _this.context.addRedoUndo({
                        redo:function () {
                            const conn=_this.context.getNodeByUUID(uuid);
                            conn.type=type;
                            conn.updatePath();
                        },
                        undo:function () {
                            const conn=_this.context.getNodeByUUID(uuid);
                            conn.type=oldType;
                            conn.updatePath();
                        }
                    })
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
        const jsonData=[];
        this.context.allFigures.forEach((figure,index)=>{
            if(figure instanceof Node){
                jsonData.push(figure.toJSON());
            }
        });
        return jsonData;
    }
}


