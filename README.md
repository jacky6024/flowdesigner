# FlowDesigner简介
FlowDesigner 是一套可以在网页中使用的基础JS绘图库，采用ES6语法编写，支持除IE以外所有浏览器,使用它可以快速绘制出各种类型的由节点和连线构成的流程图。
在线DEMO：http://58.246.62.194:16808/flow-designer-demo/
# 安装 
在一个已有的基于npm的js项目当中，执行命令
`npm install flowdesigner`
即可将最新版本的flowdesigner安装到本地的JS项目当中。

# 使用
使用设计器，第一步是需要添加节点，比如下面的代码当中就可以添加一个Start节点,
```
import {Node} from 'flowdesigner';
export default class StartNode extends Node{`
    getSvgIcon(){
        return 'start.svg';
    }
}
```
这里的getSvgIcon方法为Node类中提供的方法，这里必须要将其覆盖，返回一个svg格式图片地址，svg格式图片可以用AI之类图像软件制作。这里返回的svg就是这个start节点上显示的图标，之所以返回svg格式图片，是因为svg支持缩放而不失真。
在实际使用当中，类似这里的StartNode因为是用户自己实现，所以还应该包含一些用户自定义的方法。
有了定义好的节点类之后，接下来，我们还需要实现一个对应的工具类，将节点类和设计器关联起来，其代码如下：
```
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
}

```
在上面的代码当中，StartTool必须要扩展自Tool类，其中的四个方法都是Tool类中提供的要求子类必须要覆盖的方法。

getType方法返回当前节点类型；getIcon方法用于返回当前节点在工具栏上的图标（这里用到的是字体图标）；newNode方法表示在工具栏中点击这个节点工具，在绘图区点击时将创建的节点对象，这里就返回一个新的StartNode对象；最后的getConfigs方法用于配置当前节点在一个图中可存在的数据（single为true表示只能有一个，否则可以有多个），in属性表示当前节点进入的连线可以有多少，为0表示不能有进入的连线，out表示出去的连线有多少。
