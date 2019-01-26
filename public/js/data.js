$(function(){
    var socket = io.connect();
    var userform = $('#userForm');
    var userarea = $('#UserArea');
    var chatarea = $('#chatArea');
    var chatform = $('#chatForm')
    var chat = $('#chat'); 
    userform.submit((e)=>{
        e.preventDefault();
        socket.emit('new user',{User:$('#name').val()},(data)=>{
            if(data){
                userarea.hide();
                chatarea.show();
                $('#logout').show();
                socket.emit('get messages','all');
            }
        });
    });
    
    socket.on('messages',(data)=>{
       data.Messages.forEach(element => {
            chat.append('\
                <div class="badge badge-info " style="width:100%;" id="messages">\
                    <div class="row">\
                        <div class="col text-left">\
                            <h6>'+element.username+'</h6>\
                        </div>\
                    </div>\
                    <div class="row">\
                        <div class="col text-left">\
                        <span>\
                            <p>'+element.message+'</p>\
                        </span>\
                    </div>\
                </div>\
                ');
            });
       });
       
       socket.on('user added',(data)=>{
        chat.append('\
        <div class="badge badge-info " style="width:100%;" id="messages">\
            <div class="row">\
                <div class="col text-left">\
                    <h6>'+data+' has joined </h6>\
                </div>\
            </div>\
        </div>\
        ');
       });

    chatform.submit((e)=>{
        e.preventDefault();
        message ={
            message:$('#message').val(),
            user:socket.username
        }
        $('#message').val('');
        displaymessages();
        
    });

    function displaymessages(){
        socket.emit('new message',message);
        
    }
    socket.on('chat user',(newMessage)=>{
        chat.append('\
        <div class="badge badge-info " style="width:100%;" id="messages">\
           <div class="row">\
                <div class="col text-left">\
                    <h6>'+newMessage.username+'</h6>\
               </div>\
            </div>\
            <div class="row">\
                <div class="col text-left">\
                   <span>\
                        <p>'+newMessage.message+'</p>\
                    </span>\
               </div>\
           </div>\
        ');
    });
});