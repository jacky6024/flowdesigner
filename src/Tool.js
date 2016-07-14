/**
 * Created by Jacky.gao on 2016/6/30.
 */
export default class Tool{
    constructor(){
        this.count=1;
    }
    getName(){
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
    getPropertyContainer(){
        return '<div/>';
    }
    getConnectionPropertyContainer() {
        return '<div/>';
    }
    _newNodeInstance(x,y,name){
        const node=this.newNode();
        if(!node){
            return null;
        }
        node._tool=this;
        node._initConfigs(this.getConfigs());
        if(!name){
            name=this.getName()+this.count++;
        }
        node._createFigure(this.context,{x,y},name);
        return node;
    }
}