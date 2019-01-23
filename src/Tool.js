/**
 * Created by Jacky.gao on 2016/6/30.
 */
export default class Tool{
    constructor(){
        this.count=1;
    }
    getType(){
        throw 'Unsupport this method.';
    }
    getIcon(){
        throw 'Unsupport this method.';
    }
    newNode(){
        throw 'Unsupport this method.';
    }
    getConfigs(){
        return {};
    }
    getPropertiesProducer(){
        return function () {
            return '<div/>';
        };
    }
    getConnectionPropertiesProducer() {
        return function () {
            return '<div/>';
        };
    }
    _newNodeInstance(x,y,name){
        const node=this.newNode();
        if(!node){
            return null;
        }
        node._tool=this;
        node._initConfigs(this.getConfigs());
        if(!name){
            name=this._buildNodeName();
        }
        const result=node._createFigure(this.context,{x,y},name);
        if(result){
            if(window._setDirty){
                window._setDirty();
            }
            return node;
        }else{
            return null;
        }
    }
    _buildNodeName(){
        let name=this.getType()+this.count++,exist=false;
        for(let figure of this.context.allFigures){
            if(figure instanceof Node){
                if(figure.name===name){
                    exist=true;
                    break;
                }
            }
        }
        if(exist){
            return this._buildNodeName();
        }else{
            return name;
        }
    }
}