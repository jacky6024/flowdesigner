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

        const canvasContainer=$(`<div style="border:solid 1px #eee;height: 600px;background-color: #ffffff;background-image: url(../icon/grid-bg.png)"></div>`);
        container.append(canvasContainer);
        this.context=new Context(canvasContainer);
        this.canvas=new Canvas(this.context);

        const propContainerId='_prop_container';
        const propertyPanel=$('<div style="width: 300px;border: solid 1px #999;border-radius: 5px;top:-550px;left:800px;background: #ffffff;box-shadow: 5px 5px 5px #888888"/>');
        canvasContainer.append(propertyPanel);

        const propertyTab=`<ul class="nav nav-tabs">
            <li class="active">
                <a href="${propContainerId}" data-toggle="tab">属性面板</a>
            </li>
        </ul>`;
        propertyPanel.append(propertyTab);
        this.propContainer=$(`<div id="${propContainerId}"/>`);
        const tabContent=$(`<div class="tab-content" style="min-height: 200px;padding:10px"/>`);
        tabContent.append(this.propContainer);
        propertyPanel.append(tabContent);
        propertyPanel.draggable();
    }

    buildEditor(){
        this._buildTools();
        this._bindSelectionEvent();
    }

    _buildTools(){
        for(let figure of this.context.toolsMap.values()){
            const tools=$(`
                <label class="btn btn-default" style="border:none;border-radius:0">
                    <input type="radio" name="tools" title="${figure.getName()}"> ${figure.getIcon()}
                </label>
            `);
            this.toolbar.append(tools);
            tools.click(function () {
                event.eventEmitter.emit(event.TRIGGER_TOOL,figure.getName());
            });
        };
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


