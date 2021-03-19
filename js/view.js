export default class View {
	origin = { x: 0, y: 0 };
	point = { x: 0, y: 0 };
	dragging = false;
	constructor(app) {
		this.app = app;
	}
	beginDrag(x, y) {
		this.offset = {
			x: x / this.scale - this.origin.x,
			y: y / this.scale - this.origin.y
		};
		this.dragging = true;
	}
	drag(x, y) {
		if(this.dragging) {
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
	}
	endDrag() {
		this.dragging = false;
		this.app.cursor = null;
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