/**
 * Created by jacky on 2016/7/8.
 */
var express=require('express');
var app=new express();
app.use(express.static(__dirname));
app.get('/',function(req,res){
    res.sendFile(__dirname+'/sample/test.html');
});
var server=app.listen(80,function(){
    console.log('server is started.')
});
