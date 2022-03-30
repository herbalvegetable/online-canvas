//let socket = io.connect('http://localhost:5000/');
let socket = io.connect('https://canvas-ws-v2.herokuapp.com/');

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 900;

let colourButtons = {
	black: document.getElementById('black'),
	white: document.getElementById('white'),
	red: document.getElementById('red'),
	orange: document.getElementById('orange'),
	yellow: document.getElementById('yellow'),
	green: document.getElementById('green'),
	blue: document.getElementById('blue'),
	purple: document.getElementById('purple'),
}
for(let colour in colourButtons){
	colourButtons[colour].addEventListener('click', ()=>{
		DrawingTool.colour = colour;
		colourButtons[colour].style.border = '2px outset lime';
		for(var otherColour in colourButtons){
			if(otherColour != colour){
				colourButtons[otherColour].style.border = `2px solid ${otherColour}`;
			}
		}
	});
}
let setSizeRange = document.getElementById('setSizeRange');
setSizeRange.addEventListener('input', ()=>{
	console.log(setSizeRange.value);
	DrawingTool.size = setSizeRange.value;
	setSizeText.value = DrawingTool.size;
});
let setSizeText = document.getElementById('setSizeText');
setSizeText.addEventListener('change', ()=>{
	setSizeRange.value = setSizeText.value;
	DrawingTool.size = setSizeRange.value;
});
function isNumberKey(e){
     var charCode = (e.which) ? e.which : e.keyCode;
     if (charCode > 31 && (charCode < 48 || charCode > 57)){
     	return false;
     }
     return true;
}

class Client{
	static id = null;
}
socket.on('updateNewSocketId', id=>{
	if(Client.id == null){
		Client.id = id;
	}
});

let key = {};
window.addEventListener('keydown', e=>{
	key[e.keyCode] = true;
});
window.addEventListener('keyup', e=>{
	key[e.keyCode] = false;
});
let mouse = {};
canvas.addEventListener('mousemove', e=>{
	var rect = canvas.getBoundingClientRect();
	mouse.x = e.clientX - rect.left;
	mouse.y = e.clientY - rect.top;
	if(mouse.down){
		draw(DrawingTool.prevX, DrawingTool.prevY, mouse.x, mouse.y, DrawingTool.colour, DrawingTool.size);
		socket.emit('updateLineDrawing', {
			x1: DrawingTool.prevX,
			y1: DrawingTool.prevY,
			x2: mouse.x,
			y2: mouse.y,
			colour: DrawingTool.colour,
			size: DrawingTool.size,
			id: Client.id, 
		});
		DrawingTool.curPosList.push([DrawingTool.prevX, DrawingTool.prevY, mouse.x, mouse.y, DrawingTool.colour, DrawingTool.size]);
	}
	DrawingTool.prevX = mouse.x;
	DrawingTool.prevY = mouse.y;
});
canvas.addEventListener('mousedown', e=>{
	if(e.button == 0){
		mouse.down = true;
		DrawingTool.curPosList = [];
		draw(mouse.x, mouse.y, null, null, DrawingTool.colour, DrawingTool.size);
		DrawingTool.curPosList.push([mouse.x, mouse.y, null, null, DrawingTool.colour, DrawingTool.size]);
		socket.emit('updateLineDrawing', {
			x1: mouse.x,
			y1: mouse.y,
			x2: null,
			y2: null,
			colour: DrawingTool.colour,
			size: DrawingTool.size,
			id: Client.id, 
		});
	}
});
canvas.addEventListener('mouseup', e=>{
	if(e.button == 0){
		mouse.down = false;
		socket.emit('updateServerLineDrawingPosList', DrawingTool.curPosList);
		DrawingTool.curPosList = [];
	}
});
class DrawingTool{
	static colour = 'black';
	static size = 10;
	static prevX;
	static prevY;
	static curPosList = [];
}
function draw(x1, y1, x2, y2, colour, size){
	if(x2 != null && y2 != null){
		ctx.strokeStyle = colour;
		ctx.lineWidth = size;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.closePath();
		ctx.fillStyle = colour;
		ctx.beginPath();
		ctx.arc(x1, y1, size/2, 0, Math.PI*2);
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.arc(x2, y2, size/2, 0, Math.PI*2);
		ctx.fill();
		ctx.closePath();
	}
	else{
		ctx.fillStyle = colour;
		ctx.beginPath();
		ctx.arc(x1, y1, size/2, 0, Math.PI*2);
		ctx.fill();
		ctx.closePath();
	}
}
socket.on('updateCurrentCanvas', posList=>{
	for (var i = 0; i < posList.length; i++) {
		for (var j = 0; j < posList[i].length; j++) {
			var data = posList[i][j];
			draw(data[0], data[1], data[2], data[3], data[4], data[5]);
		}
	}
});
socket.on('updateLineDrawing', data=>{
	if(data.id != Client.id){
		draw(data.x1, data.y1, data.x2, data.y2, data.colour, data.size);
	}
});