import GameEngine from '../deps.js';
import { Wire } from './wire.js';

export class Node extends GameEngine.Surface {
	constructor(x, y) {
		super(x, y, new GameEngine.Shape.Circle(5));
		this.on = false;
		this.streams = [];
		this.wires = [];
		this.parent = null;
		this.draggable = false;
		this.offset;
	}
	update() {
		let active = false;
		for(const stream of this.streams) {
			if(stream.on) {
				active = true;
				break;
			}
		}
		this.on = active;
	}
	onclick(event) {
		const {state, groups} = GameEngine.instance;
		const {button} = event;
		if(button === 0 && state.mode === 'view') {
			if(state.target) {
				if(state.target.parent !== this.parent || state.target.parent === null && this.parent === null) {
					let unique = true;
					for(const wire of state.target.wires) {
						const [begin, end] = wire.nodes;
						if(begin === state.target && end === this) {
							unique = false;
							break;
						}
						if(begin === this && end === state.target) {
							unique = false;
							break;
						}
					}
					if(unique) {
						if(state.target !== this) {
							groups.wire.add(new Wire(state.target, this));
							state.target = null;
						}
					}
				}
			}
			else {
				state.target = this;
			}
		}
	}
	onmousedown(event) {
		const {mode, view} = GameEngine.instance.state;
		if(mode === 'move') {
			const {x, y} = view.get(event.layerX, event.layerY);
			this.draggable = true;
			this.offset = {
				x: this.x - x,
				y: this.y - y
			}
		}
	}
	onmousemove() {
		if(this.draggable) {
			const {x, y} = GameEngine.instance.state.mouse;
			this.x = x + this.offset.x;
			this.y = y + this.offset.y;
			if(this.nodes_offset) {
				this.nodes.forEach((node, index) => {
					node.x = x - this.nodes_offset[index].x;
					node.y = y - this.nodes_offset[index].y;
				});
			}
		}
	}
	onmouseup() {
		this.draggable = false;
	}
	oncontextmenu() {
		const {groups} = GameEngine.instance;
		for(const wire of this.wires) {
			wire.eject(this);
			groups.wire.remove(wire);
		}
		this.wires = [];
		if(!(this instanceof Source)) {
			this.streams = [];
		}
	}
	render(g) {
		g.fillStyle = 'white';
		g.beginPath();
		g.arc(this.x, this.y, this.shape.radius, 2 * Math.PI, 0);
		g.fill();
		g.beginPath();
		g.arc(this.x, this.y, this.shape.radius, 2 * Math.PI, 0);
		g.fillStyle = 'black';
		g[this.on ? 'fill' : 'stroke']();
	}
}

export class Source extends Node {
	constructor(x, y) {
		super(x, y);
		this.streams.push(new Stream(this));
	}
	set active(on) {
		this.streams[0].on = on;
	}
	get active() {
		return this.streams[0].on;
	}
}

class Stream {
	constructor(source, index) {
		this.source = source;
		this.index = index || 1;
		this.on = false;
	}
	adopt() {
		return new Stream(this.source, this.index + 1);
	}
	equals(stream) {
		return stream && this.source === stream.source;
	}
}