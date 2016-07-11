/**
 * Created by Jacky.gao on 2016/6/30.
 */
export default class Tool{
    constructor(){
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

}