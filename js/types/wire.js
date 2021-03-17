export class Wire {
	constructor(...nodes) {
		if(nodes.length !== 2) {
			throw new Error('A wire requires two Nodes!');
		}
		if(nodes[0] === nodes[1]) {
			throw new Error('A wire requires two different Nodes!');
		}
		const [begin, end] = nodes;
		begin.wires.push(this);
		end.wires.push(this);
		this.nodes = nodes;
	}
	eject(node) {
		const [begin, end] = this.nodes;
		if(begin !== node) {
			const i = begin.wires.findIndex(n => n === this);
			if(i !== -1) {
				begin.wires.splice(i, 1);
			}
			for(const ib in begin.streams) {
				const target = begin.streams[ib];
				const is = node.streams.findIndex(n => n.equals(target));
				if(is != -1) {
					const stream = node.streams[is];
					if(target.index > stream.index) {
						if(begin.wires.length > 0) {
							target.detached = true;
						}
						else {	
							begin.streams.splice(ib, 1);
						}
					}
				}
			}
		}
		if(end !== node) {
			const i = end.wires.findIndex(n => n === this);
			if(i !== -1) {
				end.wires.splice(i, 1);
			}
			for(const ie in end.streams) {
				const target = end.streams[ie];
				const is = node.streams.findIndex(n => n.equals(target));
				if(is != -1) {
					const stream = node.streams[is];
					if(target.index > stream.index) {
						if(end.wires.length > 0) {
							target.detached = true;
						}
						else {	
							end.streams.splice(ie, 1);
						}
					}
				}
			}
		}
	}
	update() {
		const [begin, end] = this.nodes;
		if(begin.streams.length > 0) {
			for(const stream of begin.streams) {
				if(!end.streams.find(n => n.equals(stream))) {
					end.streams.push(stream.adopt());
				}
			}
		}
		if(end.streams.length > 0) {
			for(const stream of end.streams) {
				if(!begin.streams.find(n => n.equals(stream))) {
					begin.streams.push(stream.adopt());
				}
			}
		}
		for(const stream of begin.streams) {
			const target = end.streams.find(n => n.equals(stream));
			if(target) {
				if(target.index > stream.index) {
					if(stream.detached) {
						target.detached = true;
						const i = begin.streams.findIndex(n => n === stream);
						if(i != -1) {
							begin.streams.splice(i, 1);
						}
					}
					else {
						target.on = stream.on;
					}
				}
			}
		}
		for(const stream of end.streams) {
			const target = begin.streams.find(n => n.equals(stream));
			if(target) {
				if(target.index > stream.index) {
					if(stream.detached) {
						target.detached = true;
						const i = end.streams.findIndex(n => n === stream);
						if(i != -1) {
							end.streams.splice(i, 1);
						}
					}
					else {
						target.on = stream.on;
					}
				}
			}
		}
	}
	render(g) {
		const[begin, end] = this.nodes;
		g.beginPath();
		g.moveTo(begin.x, begin.y);
		g.lineTo(end.x, end.y);
		g.stroke();
	}
}