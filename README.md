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
