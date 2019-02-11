// required modules
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const helpers = require('handlebars-helpers')();
const PORT = 5000;
const app = new express();


// Middlewares
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

// Mongoose promise handling
mongoose.Promise = global.Promise;

// MongoDB connection to localhost
mongoose.connect('mongodb://localhost:27017/chatroom',{
    useMongoClient:true
}).then(() =>{
    console.log('Connected to MongoDB ....');
}).catch(err =>{
    console.log(err);
});

//globals
Connections =[];

// loading the message schema
require('./models/messages');
const Message = mongoose.model('message');

app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/exit',(req,res)=>{
    res.redirect('/');
})

io.on('connection',function(socket){
    Connections.push(socket);// socket connection on server side
    console.log(`Connected : ${Connections.length} Connections`);
    
    socket.on('disconnect',(data)=>{ // socket disconnection to server side
        Connections.splice(Connections.indexOf(socket),1);
        console.log(`Disconnected: ${Connections.length} Connections`);
        io.emit('user exit',socket.username);
    });
    
    // to receive user data
    socket.on('new user',(data,next)=>{
        socket.username = data.User;
        next(true);
    });

    // to send all the messages
    socket.on('get messages',(data)=>{
        Message.find({}).limit(100)
        .then(messages=>{
            socket.emit('messages',{
                Messages:messages,}
            );
            // emits user entry to all chat users
            io.emit('user added',socket.username);
        });
    });

    // to receive new message data
    socket.on('new message',(data)=>{
        var message = {
            message:data.message,
            username:socket.username
        }
        new Message(message).save()
        .then(message=>{
            console.log('saved');
        });
        // emits the message to all users
        io.emit('chat user',message);
    });
});

http.listen(PORT,()=>{
    console.log(`Server Started on port ${PORT}`);
});