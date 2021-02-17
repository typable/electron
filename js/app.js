import { Group, Rect, scaleCanvas, collide } from './util.js';
import { Node, Wire, Element } from './type.js';

const MODE = {
	default: 'default',
	move: 'move'
};

export default class App {
	constructor() {
		this.viewport = new Viewport();
		this.viewport.bindEvents(this);
		this.group = {
			node: new Group(),
			wire: new Group(),
			element: new Group()
		};
		this.setMode(MODE.default);
	}
	update() {
		this.group.node.update();
		this.group.wire.update();
		this.group.element.update();
	}
	render() {
		let { g } = this.viewport;
		let view = this.viewport.getView();
		g.clearRect(view.x, view.y, view.width, view.height);
		this.group.wire.render(g);
		this.group.node.render(g);
		this.group.element.render(g);
	}
	add(type) {
		if(type instanceof Node) {
			this.group.node.add(type);
		}
		if(type instanceof Wire) {
			this.group.wire.add(type);
		}
		if(type instanceof Element) {
			this.group.element.add(type);
		}
	}
	setMode(mode) {
		this.mode = mode;
	}
	onclick(event) {
		let point = this.viewport.get(event.layerX, event.layerY);
		if(this.mode === MODE.default) {
			if(event.button === 0) {
				for(let item of [...this.group.element.get()].reverse()) {
					if(collide(item, point)) {
						if(item.onclick) {
							item.onclick();
						}
						break;
					}
				}
			}
		}
	}
	onpress(event) {
		let point = this.viewport.get(event.layerX, event.layerY);
		if(this.mode === MODE.default) {
			if(event.button === 0) {
				for(let item of [...this.group.element.get()].reverse()) {
					if(collide(item, point)) {
						if(item.onpress) {
							item.onpress();
						}
						break;
					}
				}
			}
			let { origin, scale } = this.viewport;
			if(event.button === 1) {
				this.viewport.offset = {
					x: event.layerX / scale - origin.x,
					y: event.layerY / scale - origin.y
				};
				this.viewport.drag = true;
			}
		}
		if(this.mode === MODE.move) {
			if(event.button === 0) {
				for(let item of [...this.group.element.get()].reverse()) {
					if(collide(item, point)) {
						let { origin, scale } = this.viewport;
						this.viewport.offset = {
							x: event.layerX - item.point.x,
							y: event.layerY - item.point.y
						};
						this.viewport.current = item;
						this.viewport.drag = true;
						break;
					}
				}
			}
		}
		event.preventDefault();
	}
	onrelease(event) {
		let point = this.viewport.get(event.layerX, event.layerY);
		if(this.mode === MODE.default) {
			if(event.button === 0) {
				for(let item of this.group.element.get()) {
					if(item.onrelease) {
						item.onrelease();
					}
				}
			}
			if(event.button === 1) {
				this.viewport.drag = false;
			}
		}
		if(this.mode === MODE.move) {
			if(event.button === 0) {
				this.viewport.drag = false;
				this.viewport.current = null;
			}
		}
	}
	onmove(event) {
		let { drag, origin, offset, scale } = this.viewport;
		if(this.mode === MODE.default) {
			if(drag) {
				let point = {
					x: event.layerX / scale - offset.x,
					y: event.layerY / scale - offset.y
				};
				let delta = {
					x: point.x - origin.x,
					y: point.y - origin.y
				};
				this.viewport.g.translate(delta.x * scale, delta.y * scale);
				this.viewport.origin = point;
			}
		}
		if(this.mode === MODE.move) {
			if(drag) {
				let item = this.viewport.current;
				if(item) {
					let point = {
						x: event.layerX - offset.x,
						y: event.layerY - offset.y
					};
					item.node.forEach((node) => {
						let delta = {
							x: node.point.x - item.point.x,
							y: node.point.y - item.point.y
						};
						node.point = {
							x: point.x + delta.x,
							y: point.y + delta.y
						};
					});
					item.point = point;
				}
			}
		}
		event.preventDefault();
	}
	onleave(event) {
		if(this.mode === MODE.default) {
			this.viewport.drag = false;
		}
		if(this.mode === MODE.move) {
			if(event.button === 0) {
				this.viewport.drag = false;
				this.viewport.current = null;
			}
		}
	}
}

class Viewport {
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
		this.canvas.addEventListener('mouseleave', app.onleave.bind(app));
		this.canvas.addEventListener('contextmenu', event => event.preventDefault());
	}
}
