/**
 * Created by Jacky.gao on 2016/6/28
 */
const path=require('path');
module.exports={
    mode:'development',
    entry: {
        test:'./sample/test.js'
    },
    output:{
        path:path.resolve('./sample'),
        filename:'[name].bundle.js'
    },
    
    module:{
        rules:[
            {
                test: /\.(jsx|js)?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options:{
                    "presets": [
                        "env"
                    ]
                }
            },
            {
                test:/\.css$/,
                use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
            },
            {
                test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000000
                        }
                    }
                ]
            }
        ]
    }
};