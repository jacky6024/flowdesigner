# FlowDesigner简介
FlowDesigner 是一套可以在网页中使用的基础JS绘图库，采用ES6语法编写，支持除IE以外所有浏览器,使用它可以快速绘制出各种类型的由节点和连线构成的流程图。
在线DEMO：http://58.246.62.194:16808/flow-designer-demo/
# 安装 
在一个已有的基于npm的js项目当中，执行命令
`npm install flowdesigner`
即可将最新版本的flowdesigner安装到本地的JS项目当中。

# 使用
使用设计器，第一步是需要添加节点，比如下面的代码当中就可以添加一个Start节点,
```javascript
import {Node} from 'flowdesigner';
export default class StartNode extends Node{`
    getSvgIcon(){
        return 'start.svg';
    }
}
```
这里的getSvgIcon方法为Node类中提供的方法，必须要将其覆盖，该方法需要返回一个svg格式图片地址（svg格式图片可以用AI之类图像软件制作）。返回的svg就是这个start节点上显示的图标，之所以返回svg格式图片，是因为svg支持缩放而不失真。
在实际使用当中，类似这里的StartNode因为是用户自己实现，所以还应该包含一些用户自定义的方法。
有了定义好的节点类之后，接下来，我们还需要实现一个对应的工具类，将节点类和设计器关联起来，其代码如下：
```javascript
import {Tool} from 'flowdesigner';
import StartNode from './StartNode.js';

export default class StartTool extends Tool{
    getType(){
        return "start";
    }
    getIcon(){
        return `<i class="flow flow-start" style="color:#737383"></i>`
    }
    newNode(){
        return new StartNode();
    }
    getConfigs(){
        return {
            in:0,
            out:1,
            single:true
        };
    }
    getPropertiesProducer(){
        const _this=this;
        return function (){
            const g=$(`<div></div>`);
            return g;
        }
    }
}

```
在上面的代码当中，StartTool必须要扩展自Tool类，其中的四个方法都是Tool类中提供的要求子类必须要覆盖的方法。

getType方法返回当前节点类型；getIcon方法用于返回当前节点在工具栏上的图标（这里用到的是字体图标）；newNode方法表示在工具栏中点击这个节点工具、再到绘图区点击鼠标时将创建的节点对象，这里就返回一个新的StartNode对象；getConfigs方法用于返回当前节点在图中的配置信息：single为true表示只能有一个，否则可以有多个；in属性表示当前节点进入的连线可以有多少，为0表示不能有进入的连线；out表示出去的连线有多少。

最后的getPropertiesProducer方法用于返回当前节点在绘图区被用户选中后出现的属性内容，这里要求返回一个function，在这个function中返回当前选中节点具体的属性内容。需要注意的是，getPropertiesProducer返回的function中的this会被替换成当前选中的节点对象，而非function自身，这样我们就可以很容易的修改选中对象的属性，下面的getPropertiesProducer代码摘自urule中规则流的ActionTool中，可以看到其修改属性的方法：
```javascript
getPropertiesProducer(){
    const _this=this;
    return function (){
        const g=$(`<div></div>`);
        const actionBeanGroup=$(`<div class="form-group"><label>动作Bean</label></div>`);
        const actionBeanText=$(`<input type="text" class="form-control" title="一个实现了com.bstek.urule.model.flow.FlowAction接口并配置到Spring中的Bean的ID">`);
        actionBeanGroup.append(actionBeanText);
        const self=this;
        actionBeanText.change(function(){
            self.actionBean=$(this).val();
        });
        actionBeanText.val(this.actionBean);
        g.append(actionBeanGroup);
        g.append(_this.getCommonProperties(this));
        return g;
    }
}
```
定义好Tool类之后，接下来就可以将其添加到设计器，同时渲染输出到页面，如下面的代码所示：
```javascript
import {FlowDesigner} from 'flowdesigner';
import StartTool from './StartTool.js';
import EndTool from './EndTool.js';
import TaskTool from './TaskTool.js';

const designer=new FlowDesigner('container');
designer.addTool(new StartTool());
designer.addTool(new EndTool());
designer.addTool(new TaskTool());
designer.buildDesigner();
```
在上面的代码当中，const designer=new FlowDesigner('container');表示创建一个设计器对象，它需要一个容器ID作用参数，接下来调用它的addTool方法将我们自定义的Tool添加到设计器中，最后调用设计器的buildDesigner方法渲染设计器。

上述这些工作完成之后，我们可以看到如在线DEMO：http://58.246.62.194:16808/flow-designer-demo/ 所示效果。

实际使用中，应该还会向工具栏添加一些其它的辅助按钮，比如保存之类，这些可调用设计器的addButton方法实现，如下面的代码所示：
```javascript
designer.addButton({
    icon:'<i class="rf rf-save"></i>',
    tip:'保存',
    click:function(){
        event.eventEmitter.emit(event.SHOW_LOADING,"数据保存中");
        const content=designer.toXML();
        if(!content){
            event.eventEmitter.emit(event.HIDE_LOADING);
            return;
        }
        let postData={content,file,newVersion:false};
        const url=window._server+'/common/saveFile';
        ajaxSave(url,postData,function () {
            event.eventEmitter.emit(event.HIDE_LOADING);
            MsgBox.alert('保存成功');
        });
    }
});
```
更为复杂的用法，可参考urule-sample中关于规则流的实现，urule-sample地址如下：http://58.246.62.194:16808/urule-sample/

URule规则引擎决策流源码地址：http://git.oschina.net/youseries/urule 这里的决策流就是基于FlowDesigner项目实现。

UFLO中提供的网页版流程设计器也是基于flowdesigner实现：http://git.oschina.net/youseries/uflo

