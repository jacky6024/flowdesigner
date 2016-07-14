/**
 * Created by Jacky.gao on 2016/6/28
 */
module.exports={
    entry:{
        test:'./sample/test.js'
    },
    output:{
        path:'./sample',
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
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
                loader: 'url-loader?limit=1000000&name=[name]-[hash].[ext]'
            }
        ]
    }
};