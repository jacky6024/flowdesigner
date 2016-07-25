/**
 * Created by jacky on 2016/7/9.
 */

export function alert(msg){
    const dialog=buildDialog('消息提示',msg);
    dialog.modal('show');
};

export function confirm(msg,callback){
    const dialog=buildDialog('确认提示',msg,[{
        name:'确认',
        click:function(){
            callback.call(this);
        }
    }]);
    dialog.modal('show');
};

export function dialog(title,content,callback){
    const dialog=buildDialog(title,content,[{
        name:'确认',
        click:function(){
            callback.call(this);
        }
    }]);
    dialog.modal('show');
};

function buildDialog(title,dialogContent,buttons){
    let modal=$(`<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true"></div>`);
    let dialog=$(`<div class="modal-dialog"></div>`);
    modal.append(dialog);
    let content=$(`<div class="modal-content">
         <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
               &times;
            </button>
            <h4 class="modal-title">
               ${title}
            </h4>
         </div>
         <div class="modal-body">
            ${typeof(dialogContent)==='string' ? dialogContent : ''}
         </div>`);
    if(typeof(dialogContent)==='object'){
        content.find('.modal-body').append(dialogContent);
    }
    dialog.append(content);
    let footer=$(`<div class="modal-footer"></div>`);
    content.append(footer);
    if(buttons){
        buttons.forEach((btn,index)=>{
            let button=$(`<button type="button" class="btn btn-default">${btn.name}</button>`);
            button.click(function(e){
                btn.click.call(this);
                modal.modal('hide');
            }.bind(this));
            footer.append(button);
        });
    }else{
        let okBtn=$(`<button type="button" class="btn btn-default" data-dismiss="modal">确定</button>`);
        footer.append(okBtn);
    }
    return modal;
};