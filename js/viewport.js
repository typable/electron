import { Rect, scaleCanvas } from './util.js';

export class Viewport {
	constructor(canvas) {
		this.canvas = document.createElement('canvas');
		this.g = this.canvas.getContext('2d');
		window.onresize = this.resize.bind(this);
		this.resize();
		document.body.append(this.canvas);
		this.drag = false;
		this.origin = { x: 0, y: 0 };
		this.offset = { x: 0, y: 0 };
		this.current = null;
	}
	move(point) {
		this.g.translate(point.x, point.y);
	}
	get(x, y) {
		let { e, f } = this.g.getTransform();
		return {
			x: x - e * 1 / this.scale,
			y: y - f * 1 / this.scale
		};
	}
	get scale() {
		return this.g.getTransform().a;
	}
	getView() {
		let { e, f } = this.g.getTransform();
		return new Rect(0 - e / this.scale, 0 - f / this.scale, this.width * this.scale, this.height * this.scale);
	}
	resize() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		scaleCanvas(this.canvas, this.width, this.height);
	}
	bindEvents(app) {
		this.canvas.addEventListener('click', app.onclick.bind(app));
		this.canvas.addEventListener('mousedown', app.onpress.bind(app));
		this.canvas.addEventListener('mouseup', app.onrelease.bind(app));
		this.canvas.addEventListener('mousemove', app.onmove.bind(app));
		document.addEventListener('mouseleave', app.onleave.bind(app));
		document.addEventListener('keydown', app.onkeypress.bind(app));
		document.addEventListener('keyup', app.onkeyrelease.bind(app));
		document.addEventListener('contextmenu', event => event.preventDefault());
	}
	setCursor(type) {
		this.canvas.style.cursor = type || '';
	}
}
