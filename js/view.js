export default class View {
	origin = { x: 0, y: 0 };
	point = { x: 0, y: 0 };
	drag = false;
	constructor(app) {
		this.app = app;
		this.app.canvas.onclick = event => {
			bindEvent(this, 'onclick', event);
			event.preventDefault();
		};
		this.app.canvas.onmousedown = event => {
			const {button, layerX: x, layerY: y} = event;
			bindEvent(this, 'ondown', event);
			if(button === 1) {
				this.offset = {
					x: x / this.scale - this.origin.x,
					y: y / this.scale - this.origin.y
				};
				this.drag = true;
				this.app.cursor = 'move';
			}
			event.preventDefault();
		};
		this.app.canvas.onmouseup = event => {
			const {button, layerX: x, layerY: y} = event;
			bindEvent(this, 'onup', event);
			if(button === 1) {
				this.drag = false;
				this.app.cursor = null;
			}
			event.preventDefault();
		};
		this.app.canvas.onmousemove = event => {
			const {layerX: x, layerY: y} = event;
			bindEvent(this, 'onmove', event);
			if(this.drag) {
				let point = {
					x: x / this.scale - this.offset.x,
					y: y / this.scale - this.offset.y
				};
				let delta = {
					x: point.x - this.origin.x,
					y: point.y - this.origin.y
				};
				this.app.g.translate(delta.x * this.scale, delta.y * this.scale);
				this.origin = point;
			}
			this.app.state.mouse = this.get(x, y);
			event.preventDefault();
		};
		document.body.onmouseleave = event => {
			bindEvent(this, 'onleave', event);
			this.drag = false;
			this.app.cursor = null;
			this.app.state.mouse = null;
			event.preventDefault();
		};
		document.body.oncontextmenu = event => {
			bindEvent(this, 'onclick', event);
			event.preventDefault();
		};
		window.onresize = () => {
			let offset = {
				x: this.point.x + this.origin.x,
				y: this.point.y + this.origin.y
			};
			this.app.resize(window.innerWidth, window.innerHeight);
			this.app.g.translate(offset.x * this.scale, offset.y * this.scale);
		};
	}
	get scale() {
		return this.app.g.getTransform().a;
	}
	get(x, y) {
		const {e, f} = this.app.g.getTransform();
		return {
			x: x - e * 1 / this.scale,
			y: y - f * 1 / this.scale
		};
	}
	getView() {
		let {e, f} = this.app.g.getTransform();
		return {
			x: 0 - e / this.scale,
			y: 0 - f / this.scale,
			width: this.app.width * this.scale,
			height: this.app.height * this.scale
		};
	}
}

function bindEvent(view, type, event) {
	const {layerX, layerY, button} = event;
	const {x, y} = view.get(layerX, layerY);
	if(view[type]) {
		view[type].bind(view.app)({ x, y, button, event });
	}
}