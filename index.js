
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    // res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname+"/index.html");
});

let onlines = {};
let whoIsTyping = {};
//連線監測
io.on('connect', (socket) => {
    //sever接收訊息
    socket.on('connection', (nickName) => {
        console.log(`${nickName} is connected.`);
        onlines[socket.id] = nickName;
        io.emit('updateOnline',onlines);
        io.emit('connection',{message:`${nickName} is connected.`,onlines:onlines});
        console.log({message:`${nickName} is connected.`,onlines});
    });
    socket.on('disconnect', () => {
        io.emit('disconnected',`${onlines[socket.id]} is disconnect.`)
        delete onlines[socket.id];
        io.emit('updateOnline',onlines);
        delete whoIsTyping[socket.id];
        io.emit('updateTyping',whoIsTyping);
        console.log('user disconnected');
        console.log(onlines);
    });
    
    
    socket.on('chat message', (data) => {
        // console.log(socket.data);
        console.log(`chat message ${data.name}:` + data.message);
        // server發送訊息
        io.emit('chat message', (data));
    });
    socket.on('private message', (data) => {
        console.log(data);
        io.emit('private message', (data));
    });

    socket.on('typing',(id) =>{
        whoIsTyping[id] = onlines[id];
        io.emit('updateTyping',whoIsTyping);
        // console.log(whoIsTyping[id]+"正在打字");
    });
    socket.on('noTyping', (id) => {
        delete whoIsTyping[id];
        io.emit('updateTyping',whoIsTyping);
    });
});


server.listen(8080, () => {
    console.log('listening on *:8080');
});

//待處理BUG
//輸入時跳出會正在輸入欄位不會刪除

//增加房間功能(鎖房間密碼 名稱)