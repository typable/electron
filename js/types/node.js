import { Surface, Shape } from '../deps.js';

import { state } from '../app.js';
import { Wire } from './wire.js';

export class Node extends Surface {
	constructor(x, y) {
		super(x, y, new Shape.Circle(5));
		this.on = false;
		this.streams = [];
		this.wires = [];
		this.parent = null;
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
		const {button} = event;
		if(button === 0) {
			if(state.target) {
				if(state.target.parent !== this.parent) {
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
							state.groups.wire.add(new Wire(state.target, this));
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
	oncontextmenu() {
		for(const wire of this.wires) {
			wire.eject(this);
			state.groups.wire.remove(wire);
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