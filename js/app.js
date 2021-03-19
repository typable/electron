import { Game, Group, collidePoint } from './deps.js';

import View from './view.js';
import { Node, Element } from './type.js';

export let state = {
	mode: 'view',
	groups: {
		element: new Group(),
		wire: new Group()
	},
	target: null,
	mouse: null
};

export class Electron extends Game {
	constructor() {
		super(window.innerWidth, window.innerHeight);
		this.state = state;
		this.view = new View(this);
		this.bindEvent(this.canvas, 'onclick');
		this.bindEvent(this.canvas, 'onmousedown');
		this.bindEvent(this.canvas, 'onmouseup');
		this.bindEvent(this.canvas, 'onmousemove');
		this.bindEvent(document.body, 'onmouseleave');
		this.bindEvent(document.body, 'oncontextmenu');
		this.bindEvent(window, 'onresize');
	}
	populateEvent(event) {
		const {type} = event;
		if(type === 'click' || type === 'mousedown' || type === 'mouseup' || type === 'mousemove' || type === 'mouseleave' || type === 'contextmenu') {
			const {layerX, layerY} = event;
			event.preventDefault();
			return { event, ...this.view.get(layerX, layerY) };
		}
		return event;
	}
	update() {
		const {click, mousedown, mouseup, mousemove, mouseleave, contextmenu} = this.events;
		if(click) {
			const {button} = click.event;
			if(button === 0) {
				const {x, y} = click;
				iterateGroup(this.state.groups.element, item => {
					if(collidePoint(item, {x, y})) {
						item.causeEvent(click);
						return true;
					}
				});
			}
		}
		if(mousedown) {
			const {button, layerX, layerY} = mousedown.event;
			if(button === 1) {
				this.view.beginDrag(layerX, layerY);
				this.cursor = 'move';
			}
			if(button === 0) {
				const {x, y} = mousedown;
				iterateGroup(this.state.groups.element, item => {
					if(collidePoint(item, {x, y})) {
						item.causeEvent(mousedown);
						return true;
					}
				});
			}
		}
		if(mousemove) {
			const {x, y} = mousemove;
			const {layerX, layerY} = mousemove.event;
			this.view.drag(layerX, layerY);
			this.state.mouse = { x, y };
			if(!this.view.dragging) {
				let cursor = null;
				iterateGroup(this.state.groups.element, item => {
					if(collidePoint(item, {x, y})) {
						if(item instanceof Node) {
							cursor = 'copy';
						}
						if(item.interactive) {
							cursor = 'pointer';
						}
						return true;
					}
				});
				this.cursor = cursor;
			}
		}
		if(mouseup) {
			const {button} = mouseup.event;
			if(button === 1) {
				this.view.endDrag();
				this.state.mouse = null;
			}
			if(button === 0) {
				iterateGroup(this.state.groups.element, item => {
					item.causeEvent(mouseup);
				});
			}
		}
		if(mouseleave) {
			this.view.endDrag();
			this.state.mouse = null;
		}
		if(contextmenu) {
			const {x, y} = contextmenu;
			if(this.state.target) {
				this.state.target = null;
			}
			else {
				iterateGroup(this.state.groups.element, item => {
					if(collidePoint(item, {x, y})) {
						item.causeEvent(contextmenu);
						return true;
					}
				});
			}
		}
		const {groups} = this.state;
		groups.element.update();
		groups.wire.update();
	}
	render(g) {
		const {groups, target, mouse} = this.state;
		const {x, y, width, height} = this.view.getView();
		g.clearRect(x, y, width, height);
		if(target instanceof Node && mouse) {
			g.beginPath();
			g.moveTo(target.x, target.y);
			g.lineTo(mouse.x, mouse.y);
			g.stroke();
		}
		groups.wire.render(g);
		groups.element.render(g);
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
		g.font = '500 14px Roboto';
		g.textBaseline = 'top';
		g.textAlign = 'left';
		g.fillStyle = '#212121';
		g.fillText(`X: ${-x}  Y: ${-y}`, x + 20, y + 20);
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