import { create } from './app.js';
import { createCanvas } from './graphic.js';
import { collide, transform, translate } from './util.js';

let width = window.innerWidth;
let height = window.innerHeight;
let fps = 60;
let then;
let now;
let elapsed;
let list = {};
let g;
let scale = 1;
let point = { x: 0, y: 0 };
let move = { x: 0, y: 0 };
let drag = false;

window.onload = function() {
	let { canvas, g: context } = createCanvas(width, height);
	g = context;
	window.g = g;
	document.body.append(canvas);
	canvas.oncontextmenu = function(event) {
		event.preventDefault();
	}
	canvas.onclick = function(event) {
		let { e: x, f: y } = g.getTransform();
		let before = {
			x: transform(event.layerX - x, scale),
			y: transform(event.layerY - y, scale)
		};
		if(event.button == 0) {
			let { element } = list;
			element.forEach((item) => {
				if(collide(item, before)) {
					if(item.onclick) {
						item.onclick(before);
					}
				}
			});
		}
	}
	canvas.onmousedown = function(event) {
		let { e: x, f: y } = g.getTransform();
		let before = {
			x: transform(event.layerX - x, scale),
			y: transform(event.layerY - y, scale)
		};
		if(event.button == 0) {
			let { element } = list;
			element.forEach((item) => {
				if(collide(item, before)) {
					if(item.onpress) {
						item.onpress(before);
					}
				}
			});
		}
		if(event.button == 1) {
			move = {
				x: translate(event.layerX, scale, point.x),
				y: translate(event.layerY, scale, point.y)
			};
			drag = true;
		}
		event.preventDefault();
	}
	canvas.onmouseup = function(event) {
		let { e: x, f: y } = g.getTransform();
		let before = {
			x: transform(event.layerX - x, scale),
			y: transform(event.layerY - y, scale)
		};
		if(event.button == 0) {
			let { element } = list;
			element.forEach((item) => {
				if(item.onrelease) {
					item.onrelease(before);
				}
			});
		}
		if(event.button == 1) {
			drag = false;
		}
	}
	canvas.onmouseleave = function(event) {
		drag = false;
	}
	canvas.onmousemove = function(event) {
		if(drag) {
			let before = {
				x: translate(event.layerX, scale, move.x),
				y: translate(event.layerY, scale, move.y)
			};
			let diff = { x: before.x - point.x, y: before.y - point.y };
			g.translate(diff.x, diff.y);
			point = before;
		}
	}
	// canvas.onwheel = function(event) {
	// 	if(event.deltaY < 0) {
	// 		g.scale(2, 2);
	// 		scale *= 2;
	// 	}
	// 	else {
	// 		g.scale(0.5, 0.5);
	// 		scale *= 0.5;
	// 	}
	// }
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
	let { element, wire } = list;
	element.forEach((item) => {
		item.update();
	});
	wire.forEach((item) => {
		item.update();
	});
}

function render() {
	let { e: x, f: y } = g.getTransform();
	g.clearRect(0 - x / scale, 0 - y/ scale, transform(width, scale), transform(height, scale));
	let { element, wire } = list;
	wire.forEach((item) => {
		g.save();
		item.render(g);
		g.restore();
	});
	element.forEach((item) => {
		g.save();
		item.render(g);
		g.restore();
	});
}
