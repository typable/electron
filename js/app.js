import GameEngine, { Util } from './deps.js';
import View from './view.js';
import { Node, Element } from './type.js';

export class Electron extends GameEngine.Game {
	constructor() {
		super(window.innerWidth, window.innerHeight);
		this.view = new View(this);
		this.bindEvent(this.canvas, 'click');
		this.bindEvent(document.body, 'mousedown');
		this.bindEvent(document.body, 'mouseup');
		this.bindEvent(document.body, 'mousemove');
		this.bindEvent(document.body, 'mouseleave');
		this.bindEvent(document.body, 'contextmenu');
		this.bindEvent(window, 'resize');
		this.groups = {
			element: new GameEngine.Group(),
			wire: new GameEngine.Group()
		},
		this.state = {
			mode: 'view',
			target: null,
			mouse: null,
			view: this.view
		};
		document.body.addEventListener('contextmenu', function(event) {
			event.preventDefault();
			return false;
		});
	}
	update() {
		this.groups.element.update();
		this.groups.wire.update();
	}
	onresize() {
		this.resize(window.innerWidth, window.innerHeight);
	}
	onclick(event) {
		const {button, layerX, layerY} = event;
		if(button === 0) {
			const {x, y} = this.view.get(layerX, layerY);
			iterateGroup(this.groups.element, item => {
				if(Util.Collision.collidePoint(item, {x, y})) {
					item.causeEvent('click', this.events);
					return true;
				}
			});
		}
	}
	onmousedown(event) {
		const {button, layerX, layerY} = event;
		if(button === 1) {
			this.view.beginDrag(layerX, layerY);
			this.cursor = 'move';
		}
		if(button === 0) {
			const {x, y} = this.view.get(layerX, layerY);
			iterateGroup(this.groups.element, item => {
				if(Util.Collision.collidePoint(item, {x, y})) {
					item.causeEvent('mousedown', this.events);
					return true;
				}
			});
		}
	}
	onmousemove(event) {
		const {pageX, pageY} = event;
		const {x, y} = this.view.get(pageX, pageY);
		this.view.drag(pageX, pageY);
		this.state.mouse = { x, y };
		if(!this.view.dragging) {
			let cursor = null;
			iterateGroup(this.groups.element, item => {
				if(Util.Collision.collidePoint(item, {x, y})) {
					if(this.state.mode === 'view') {
						if(item instanceof Node) {
							cursor = 'copy';
						}
						if(item.interactive) {
							cursor = 'pointer';
						}
						return true;
					}
					if(this.state.mode === 'move') {
						if(item.draggable !== undefined) {
							cursor = 'grab';
							if(item.draggable) {
								cursor = 'grabbing';
							}
						}
						return true;
					}
				}
			});
			this.cursor = cursor;
		}
		this.groups.element.causeEvent('mousemove', this.events);
	}
	onmouseup(event) {
		const {button} = event;
		if(button === 1) {
			this.view.endDrag();
			this.state.mouse = null;
		}
		if(button === 0) {
			iterateGroup(this.groups.element, item => {
				item.causeEvent('mouseup', this.events);
			});
		}
	}
	onmouseleave() {
		this.view.endDrag();
		this.state.mouse = null;
	}
	oncontextmenu(event) {
		const {layerX, layerY} = event;
		const {x, y} = this.view.get(layerX, layerY);
		if(this.state.target) {
			this.state.target = null;
		}
		else {
			iterateGroup(this.groups.element, item => {
				if(Util.Collision.collidePoint(item, {x, y})) {
					item.causeEvent('contextmenu', this.events);
					return true;
				}
			});
		}
	}
	render(g) {
		const {target, mouse} = this.state;
		const {x, y, width, height} = this.view.getView();
		g.clearRect(x, y, width, height);
		if(target instanceof Node && mouse) {
			g.beginPath();
			g.moveTo(target.x, target.y);
			g.lineTo(mouse.x, mouse.y);
			g.stroke();
		}
		this.groups.wire.render(g);
		this.groups.element.render(g);
		g.strokeStyle = '#999';
		g.beginPath();
		g.arc(0, 0, 6, 2 * Math.PI, 0);
		g.stroke();
		g.beginPath();
		g.moveTo(-20, 0);
		g.lineTo(20, 0);
		g.stroke();
		g.beginPath();
		g.moveTo(0, -20);
		g.lineTo(0, 20);
		g.stroke();
	}
	set cursor(type) {
		this.canvas.style.cursor = type || '';
	}
	get cursor() {
		return this.canvas.style.cursor;
	}
}

function iterateGroup(group, handle) {
	for(const element of [...group].reverse()) {
		if(element instanceof Element) {
			for(const node of [...element.nodes].reverse()) {
				const done = handle(node);
				if(done) {
					return;
				}
			}
		}
		const done = handle(element);
		if(done) {
			return;
		}
	}
}