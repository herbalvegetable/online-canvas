const express = require('express');
const socket = require('socket.io');

let app = express();
let port = process.env.PORT || 5000;
let server = app.listen(port, ()=>{
	console.log(`Server listening to port ${port}`);
});
app.use(express.static('public'));

let io = socket(server);
class Server{
	static lineDrawingPosList = [];
}
io.on('connection', socket=>{
	console.log(`Client connected: ${socket.id}`);
	io.emit('updateNewSocketId', socket.id);
	io.emit('updateCurrentCanvas', Server.lineDrawingPosList);
	socket.on('updateLineDrawing', data=>{
		console.log('update line drawing');
		io.emit('updateLineDrawing', data);
	});
	socket.on('updateServerLineDrawingPosList', posList=>{
		Server.lineDrawingPosList.push(posList);
		console.log(Server.lineDrawingPosList);
	});
});
