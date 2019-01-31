
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const helpers = require('handlebars-helpers')();
const PORT = 5000;
const app = new express();

var hbs = exphbs.create({
    defaultLayout:'layout',
    helpers: helpers
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(session({
  secret: 'secrets',
  resave: true,
  saveUninitialized: true,
}));
app.use(express.static('public'));
const http = require('http').Server(app);
const io = require('socket.io')(http);

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/chatroom',{
    useMongoClient:true
}).then(() =>{
    console.log('Connected to MongoDB ....');
}).catch(err =>{
    console.log(err);
});

//globals
Connections =[];

require('./models/messages');
const Message = mongoose.model('message');

app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/exit',(req,res)=>{
    res.redirect('/');
})

io.on('connection',function(socket){
    Connections.push(socket);
    console.log(`Connected : ${Connections.length} Connections`);
    
    socket.on('disconnect',(data)=>{
        Connections.splice(Connections.indexOf(socket),1);
        console.log(`Disconnected: ${Connections.length} Connections`);
        if(socket.username!=null){
            io.emit('user left',socket.username);
        }
    });
    
    socket.on('new user',(data,next)=>{
        socket.username = data.User;
        next(true);
    });

    socket.on('get messages',(data)=>{
        Message.find({}).limit(100).sort({time:-1})
        .then(messages=>{
            socket.emit('messages',{
                Messages:messages,}
            );
            io.emit('user added',socket.username);
        });
    });

    socket.on('new message',(data)=>{
        var message = {
            message:data.message,
            username:socket.username
        }
        new Message(message).save()
        .then(message=>{
            console.log('saved');
        });
        io.emit('chat user',message);
    });
});

http.listen(PORT,()=>{
    console.log(`Server Started on port ${PORT}`);
});