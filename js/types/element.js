import GameEngine from '../deps.js';
import { Node, Source } from './node.js';

export class Element extends GameEngine.Surface {
	constructor(x, y, shape) {
		super(x, y, shape);
		this.nodes = [];
		this.symbols = {};
		this.draggable = false;
		this.offset;
		this.nodes_offset = [];
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
	onmousedown(event) {
		const {mode, view} = GameEngine.instance.state;
		const {x, y} = view.get(event.layerX, event.layerY);
		if(mode === 'move') {
			if(this.interactive !== undefined) {
				this.interactive = false;
			}
			this.draggable = true;
			this.offset = {
				x: this.x - x,
				y: this.y - y
			}
			this.nodes.forEach((node) => {
				let nodes_offset = {
					x: x - node.x,
					y: y - node.y
				};
				this.nodes_offset.push(nodes_offset);
			});
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
		this.offset = [];
		this.nodes_offset = [];
		if(this.interactive !== undefined) {
			this.interactive = true;
		}
		this.draggable = false;
	}
	render(g) {
		const {x, y, shape} = this;
		if(shape instanceof GameEngine.Shape.Rect) {
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
	interactive = false;
	constructor(x, y) {
		super(x, y, new GameEngine.Shape.Rect(54, 54));
		this.add(new Source(x + 54, y + 27), 'c');
	}
	update() {
		super.update();
	}
	onmousedown(event) {
		super.onmousedown(event);
		const {c} = this.symbols;
		if(this.interactive) {
			c.active = true;
		}
	}
	onmouseup() {
		super.onmouseup();
		const {c} = this.symbols;
		if(this.interactive) {
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
		super(x, y, new GameEngine.Shape.Circle(18));
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