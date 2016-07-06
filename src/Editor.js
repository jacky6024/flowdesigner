/**
 * Created by Jacky.gao on 2016/6/29.
 */
import Canvas from './Canvas.js';
import Context from './Context.js';
import * as event from './event.js';

export default class Editor{
    constructor(containerId){
        const container=$('#'+containerId);
        this.toolbar=$(`<div class="btn-group" data-toggle="buttons" style="border:solid 1px #dddddd;width:100%"></div>`);
        container.append(this.toolbar);
        container.append(this.toolbarContainer);
        const canvasContainer=$(`<div style="border:solid 1px #f0ad4e;margin-top: 5px;height:500px;width:100%;position:relative"></div>`);
        container.append(canvasContainer);
        this.context=new Context(canvasContainer);
        this.canvas=new Canvas(this.context);
    }
    buildEditor(){
        for(let figure of this.context.toolsMap.values()){
            const tool=$(`
                <label class="btn btn-default" style="border:none;border-radius:0">
                    <input type="radio" name="tools" title="${figure.getName()}"> ${figure.getIcon()}
                </label>
            `);
            this.toolbar.append(tool);
            tool.click(function () {
                event.eventEmitter.emit(event.TRIGGER_TOOL,figure.getName());
            });
        };

    }



    addFigure(figure){
        this.context.registerFigure(figure);
        return this;
    }
}


