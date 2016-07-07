/**
 * Created by Jacky.gao on 2016/6/30.
 */
export default class Tool{
    constructor(context){
        this.context=context;
    }
    getName(){
        throw 'Unsupport this method.';
    }
    getIcon(){
        throw 'Unsupport this method.';
    }
    newFigure(){
        throw 'Unsupport this method.';
    }
    getConfigs(){
        return {};
    }
    getPropertyContainer(){
        return '<div/>';
    }
    getInConnectionPropertyContainer() {
        return '<div/>';
    }
    getOutConnectionPropertyContainer(){
        return '<div/>';
    }

}