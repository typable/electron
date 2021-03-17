import { Surface, Shape } from 'https://git.typable.dev/std/js/game.js';

import { Source } from './node.js';

export class Element extends Surface {
	constructor(x, y, width, height) {
		super(x, y, new Shape.Rect(width, height));
		this.nodes = [];
		this.symbols = {};
		this.events = {};
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
		const {x, y, shape: {width, height}} = this;
		g.fillStyle = 'lightgrey';
		g.beginPath();
		g.rect(x, y, width, height);
		g.fill();
		g.beginPath();
		g.rect(x, y, width, height);
		g.stroke();
		for(const node of this.nodes) {
			node.render(g);
		}
	}
}

export class Button extends Element {
	constructor(x, y) {
		super(x, y, 50, 50);
		this.add(new Source(x + 50, y + 25), 'out');
	}
	update() {
		super.update();
		const {mousedown, mouseup} = this.events;
		if(mousedown) {
			this.symbols.out.active = true;
		}
		if(mouseup) {
			this.symbols.out.active = false;
		}
	}
	render(g) {
		super.render(g);
		const {x, y, shape: {width, height}} = this;
		const {out} = this.symbols;
		g.fillStyle = 'grey';
		g.beginPath();
		g.arc(x + width / 2, y + height / 2, (out.active ? 12 : 14), 2 * Math.PI, 0);
		g.fill();
		g.beginPath();
		g.arc(x + width / 2, y + height / 2, (out.active ? 12 : 14), 2 * Math.PI, 0);
		g.stroke();
	}
}