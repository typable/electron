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
		let { x, y } = this.viewport.origin;
		let view = this.viewport.getView();
		g.clearRect(view.x, view.y, view.width, view.height);
		this.group.wire.render(g);
		this.group.node.render(g);
		this.group.element.render(g);
		g.font = '14px monospace';
		g.textBaseline = 'top';
		g.textAlign = 'left';
		g.fillText('Mode: ' + this.mode.toUpperCase(), view.x + 20, view.y + 20);
		g.fillText('X: ' + x + ' Y: ' + y, view.x + 20, view.y + 40);
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
				this.viewport.setCursor('move');
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
						this.viewport.drag = true
						this.viewport.setCursor('grabbing');
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
				this.viewport.setCursor();
			}
		}
		if(this.mode === MODE.move) {
			if(event.button === 0) {
				this.viewport.drag = false;
				this.viewport.current = null
				this.viewport.setCursor();
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
			else {
				let point = this.viewport.get(event.layerX, event.layerY);
				let found = false;
				for(let item of [...this.group.element.get()].reverse()) {
					if(item.interact) {
						if(collide(item, point)) {
							this.viewport.setCursor('pointer');
							found = true;
							break;
						}
					}
				}
				if(!found) {
					this.viewport.setCursor();
				}
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
					item.point = point
				}
			}
			else {
				let point = this.viewport.get(event.layerX, event.layerY);
				let found = false;
				for(let item of [...this.group.element.get()].reverse()) {
					if(collide(item, point)) {
						this.viewport.setCursor('grab');
						found = true;
						break;
					}
				}
				if(!found) {
					this.viewport.setCursor();
				}
			}
		}
		event.preventDefault();
	}
	onleave(event) {
		if(this.mode === MODE.default) {
			this.viewport.drag = false;
			this.viewport.setCursor();
		}
		if(this.mode === MODE.move) {
			if(event.button === 0) {
				this.viewport.drag = false;
				this.viewport.current = null;
				this.viewport.setCursor();
			}
		}
	}
	onkeypress(event) {
		let { key, shiftKey, ctrlKey } = event;
		if(key === 'Tab' && !shiftKey && !ctrlKey) {
			this.mode = this.mode === MODE.default ? MODE.move : MODE.default;
			event.preventDefault();
		}
		if(this.mode === MODE.default) {
			if(/^[a-z0-9]{1}$/.test(key)) {
				for(let item of this.group.element.get()) {
					if(item.onkeypress) {
						item.onkeypress(key);
					}
				}
			}
		}
	}
	onkeyrelease(event) {
		let { key, shiftKey, ctrlKey } = event;
		if(this.mode === MODE.default) {
			if(/^[a-z0-9]{1}$/.test(key)) {
				for(let item of this.group.element.get()) {
					if(item.onkeyrelease) {
						item.onkeyrelease(key);
					}
				}
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
		document.addEventListener('mouseleave', app.onleave.bind(app));
		document.addEventListener('keydown', app.onkeypress.bind(app));
		document.addEventListener('keyup', app.onkeyrelease.bind(app));
		document.addEventListener('contextmenu', event => event.preventDefault());
	}
	setCursor(type) {
		this.canvas.style.cursor = type || '';
	}
}
