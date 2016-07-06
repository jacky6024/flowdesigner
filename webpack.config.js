/**
 * Created by Jacky.gao on 2016/6/28
 */
module.exports={
    entry:{
        designer:'./src/designer.js'
    },
    output:{
        path:'./bin',
        filename:'[name].bundle.js'
    },
    module:{
        loaders:[
            {
                test:/\.js$/,
                exclude:/node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            },
            {test: /\.css$/, loader: "style-loader!css-loader"}
        ]
    }
};