$(function(){
    var socket = io.connect(); // Socket Connection

    // html area variables
    var userform = $('#userForm');
    var userarea = $('#UserArea');
    var chatarea = $('#chatArea');
    var chatform = $('#chatForm')
    var chat = $('#chat');
    
    // login form submission
    userform.submit((e)=>{
        e.preventDefault();
        // emit request to create a new user
        socket.emit('new user',{User:$('#name').val()},(data)=>{
            if(data){
                userarea.hide();
                chatarea.show();
                $('#logout').show();
                // emit requrest to get all messages
                socket.emit('get messages','all');
            }
        });
    });
    
    // to receive all messages from server
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

    // to receive info about the added user and display to all the chat members  
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

    // to receive info about the exited user and isplay to all the chat members
    socket.on('user exit',(data)=>{
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


    //chat area form submission
    chatform.submit((e)=>{
        e.preventDefault();
        message ={
            message:$('#message').val(),
            user:socket.username
        }
        $('#message').val('');
        displaymessages();
        
    });

    // function to emit a request to display the new added message
    function displaymessages(){
        socket.emit('new message',message);
        
    }
    // to display the new added message
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