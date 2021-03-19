import { Surface, Shape } from '../deps.js';

import { Node, Source } from './node.js';

export class Element extends Surface {
	constructor(x, y, shape) {
		super(x, y, shape);
		this.nodes = [];
		this.symbols = {};
	}
	add(node, symbol) {
		this.nodes.push(node);
		node.parent = this;
		if(symbol) {
			this.symbols[symbol] = node;
		}
	}
	update() {
		for(const node of this.nodes) {
			node.update();
		}
	}
	render(g) {
		const {x, y, shape} = this;
		if(shape instanceof Shape.Rect) {
			const {width, height} = shape;
			g.fillStyle = 'lightgrey';
			g.beginPath();
			g.rect(x, y, width, height);
			g.fill();
			g.beginPath();
			g.rect(x, y, width, height);
			g.stroke();
		}
		for(const node of this.nodes) {
			node.render(g);
		}
	}
}

export class Button extends Element {
	interactive = true;
	constructor(x, y) {
		super(x, y, new Shape.Rect(54, 54));
		this.add(new Source(x + 54, y + 27), 'c');
	}
	update() {
		super.update();
		const {mousedown, mouseup} = this.events;
		const {c} = this.symbols;
		if(mousedown) {
			c.active = true;
		}
		if(mouseup) {
			c.active = false;
		}
	}
	render(g) {
		super.render(g);
		const {x, y, shape: {width, height}} = this;
		const {c} = this.symbols;
		g.fillStyle = 'grey';
		g.beginPath();
		g.arc(x + width / 2, y + height / 2, (c.active ? 12 : 14), 2 * Math.PI, 0);
		g.fill();
		g.beginPath();
		g.arc(x + width / 2, y + height / 2, (c.active ? 12 : 14), 2 * Math.PI, 0);
		g.stroke();
	}
}

export class Light extends Element {
	constructor(x, y) {
		super(x, y, new Shape.Circle(18));
		this.add(new Node(x - 18, y), 'x');
	}
	render(g) {
		const {x, y, shape: {radius}} = this;
		g.fillStyle = this.symbols.x.on ? 'yellow' : 'white';
		g.beginPath();
		g.arc(x, y, radius, 2 * Math.PI, 0);
		g.fill();
		g.beginPath();
		g.arc(x, y, radius, 2 * Math.PI, 0);
		g.stroke();
		g.beginPath();
		const angle = 1 / 4 * Math.PI;
		g.moveTo(x + radius * Math.cos(-angle), y + radius * Math.sin(-angle));
		g.lineTo(x + radius * Math.cos(3 * angle), y + radius * Math.sin(3 * angle));
		g.stroke();
		g.beginPath();
		g.moveTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
		g.lineTo(x + radius * Math.cos(3 * -angle), y + radius * Math.sin(3 * -angle));
		g.stroke();
		g.fillStyle = 'black';
		super.render(g);
	}
}