import App from './app.js';
import { createCanvas, scaleCanvas } from './graphic.js';
import { collide, transform, translate } from './util.js';
import { bind, prevent } from './event.js';

let app;

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
	app = new App();
	app.create();
	window.app = app;
	let { canvas, g: context } = createCanvas(width, height);
	g = context;
	document.body.append(canvas);
	window.onresize = function() {
		width = window.innerWidth;
		height = window.innerHeight;
		scaleCanvas(canvas, width, height);
	};
	canvas.oncontextmenu = prevent;
	// canvas.onclick = onclick;
	canvas.onmousedown = onpress;
	canvas.onmouseup = onrelease;
	canvas.onmouseleave = function(event) {
		drag = false;
	};
	canvas.onmousemove = onmove;
	canvas.ontouchmove = onmove;
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
	bind();
	// create(list);
	then = Date.now();
	requestAnimationFrame(loop);
};

function loop() {
	requestAnimationFrame(loop);
	now = Date.now();
	elapsed = now - then;
	if(elapsed > (1000 / fps)) {
		then = now - (elapsed % (1000 / fps));
		app.update();
		render();
	}
}

function render() {
	let { e: x, f: y } = g.getTransform();
	g.clearRect(0 - x / scale, 0 - y/ scale, transform(width, scale), transform(height, scale));
	app.render(g);
}

function onmove(event) {
	if(drag) {
		let before = {
			x: translate(event.layerX, scale, move.x),
			y: translate(event.layerY, scale, move.y)
		};
		let diff = { x: before.x - point.x, y: before.y - point.y };
		g.translate(diff.x, diff.y);
		point = before;
	}
	event.preventDefault();
}

function onclick(event) {
	let { e: x, f: y } = g.getTransform();
	let before = {
		x: transform(event.layerX - x, scale),
		y: transform(event.layerY - y, scale)
	};
	if(event.button === 0) {
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

function onpress(event) {
	let { e: x, f: y } = g.getTransform();
	let before = {
		x: transform(event.layerX - x, scale),
		y: transform(event.layerY - y, scale)
	};
	if(event.button === 0) {
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

function onrelease(event) {
	let { e: x, f: y } = g.getTransform();
	let before = {
		x: transform(event.layerX - x, scale),
		y: transform(event.layerY - y, scale)
	};
	if(event.button === 0) {
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