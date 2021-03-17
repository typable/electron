import { Game, Group, Shape } from 'https://git.typable.dev/std/js/game.js';
import { collidePoint } from 'https://git.typable.dev/std/js/collision.js';

import View from './view.js';
import { Node } from './type.js';

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
		this.view.onclick = props => {
			const {x, y, button, event} = props;
			if(button === 0) {
				let found = false;
				for(const element of [...this.state.groups.element.items].reverse()) {
					if(element.nodes) {
						for(const node of [...element.nodes].reverse()) {
							if(collidePoint(node, {x, y})) {
								node.events[event.type] = event;
								found = true;
								break;
							}
						}
					}
					if(!found) {
						if(collidePoint(element, {x, y})) {
							element.events[event.type] = event;
							break;
						}
					}
				}
			}
		};
		this.view.ondown = props => {
			const {x, y, button, event} = props;
			if(button === 0) {
				let found = false;
				for(const element of [...this.state.groups.element.items].reverse()) {
					if(element.nodes) {
						for(const node of [...element.nodes].reverse()) {
							if(collidePoint(node, {x, y})) {
								node.events[event.type] = event;
								found = true;
								break;
							}
						}
					}
					if(!found) {
						if(collidePoint(element, {x, y})) {
							element.events[event.type] = event;
							break;
						}
					}
				}
			}
		};
		this.view.onup = props => {
			const {x, y, button, event} = props;
			if(button === 0) {
				for(const element of this.state.groups.element) {
					element.events[event.type] = event;
				}
			}
		};
		this.view.onmove = props => {
			const {x, y, button, event} = props;
			if(!this.view.drag) {
				let found = false;
				let target = null;
				for(const element of [...this.state.groups.element.items].reverse()) {
					if(element.nodes) {
						for(const node of [...element.nodes].reverse()) {
							if(collidePoint(node, {x, y})) {
								found = true;
								target = node;
								break;
							}
						}
					}
					if(!found) {
						if(collidePoint(element, {x, y})) {
							found = true;
							target = element;
							break;
						}
					}
				}
				this.cursor = found ? (target instanceof Node ? 'copy' : 'pointer') : null;
			}
		};
	}
	update() {
		const {groups} = this.state;
		groups.element.update();
		groups.wire.update();
		for(const element of groups.element) {
			if(element.nodes) {
				for(const node of element.nodes) {
					node.events = {};
				}
			}
			element.events = {};
		}
	}
	render(g) {
		const {mode, groups, target, mouse} = this.state;
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
		g.font = '14px monospace';
		g.textBaseline = 'top';
		g.textAlign = 'left';
		g.fillText('Mode: ' + mode.toUpperCase(), x + 20, y + 20);
		g.fillText('X: ' + -x + ' Y: ' + -y, x + 20, y + 40);
	}
	set cursor(type) {
		this.canvas.style.cursor = type || '';
	}
	get cursor() {
		return this.canvas.style.cursor;
	}
}