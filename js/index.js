import { create } from './app.js';
import { createCanvas } from './graphic.js';

let width = window.innerWidth;
let height = window.innerHeight;
let fps = 60;
let then;
let now;
let elapsed;
let list = [];
let g;

window.onload = function() {
	let { canvas, g: context } = createCanvas(width, height);
	g = context;
	document.body.append(canvas);
	canvas.onclick = function(event) {
		let point = { x: event.layerX, y: event.layerY };
		for(let item of list) {
			if(collide(item, point)) {
				if(item.onclick) {
					item.onclick(point);
				}
			}
		}
	}
	canvas.onmousedown = function(event) {
		let point = { x: event.layerX, y: event.layerY };
		for(let item of list) {
			if(collide(item, point)) {
				if(item.onpress) {
					item.onpress(point);
				}
			}
		}
	}
	canvas.onmouseup = function(event) {
		let point = { x: event.layerX, y: event.layerY };
		for(let item of list) {
			if(item.onrelease) {
				item.onrelease(point);
			}
		}
	}
	create(list);
	then = Date.now();
	requestAnimationFrame(loop);
};

function loop() {
	requestAnimationFrame(loop);
	now = Date.now();
	elapsed = now - then;
	if(elapsed > (1000 / fps)) {
		then = now - (elapsed % (1000 / fps));
		update();
		render();
	}
}

function update() {
	list.forEach((item) => {
		if(item.update) {
			item.update()
		}
	});
}

function render() {
	g.clearRect(0, 0, width, height);
	list.forEach((item) => {
		g.save();
		item.render(g);
		g.restore();
	});
}

function collide(item, point) {
	if(item && item.point && point) {
		return item.point.x < point.x && item.point.x + 50 > point.x && item.point.y < point.y && item.point.y + 50 > point.y;
	}
	return false;
}
