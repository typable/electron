export class Wire {
	constructor(...node) {
		if(node.length !== 2) {
			throw new Error('A wire requires two Nodes!');
		}
		if(node[0] === node[1]) {
			throw new Error('A wire requires two different Nodes!');
		}
		this.node = node;
	}
	update() {
		const[begin, end] = this.node;
		if(begin.streams.length > 0) {
			for(const stream of begin.streams) {
				if(!findStream(stream, end.streams)) {
					end.streams.push(stream.adopt());
				}
			}
		}
		if(end.streams.length > 0) {
			for(const stream of end.streams) {
				if(!findStream(stream, begin.streams)) {
					begin.streams.push(stream.adopt());
				}
			}
		}
		for(const stream of begin.streams) {
			const target = findStream(stream, end.streams);
			if(target) {
				if(target.index > stream.index) {
					target.on = stream.on;
				}
			}
		}
		for(const stream of end.streams) {
			const target = findStream(stream, begin.streams);
			if(target) {
				if(target.index > stream.index) {
					target.on = stream.on;
				}
			}
		}
	}
	render(g) {
		const[begin, end] = this.node;
		g.beginPath();
		g.moveTo(begin.x, begin.y);
		g.lineTo(end.x, end.y);
		g.stroke();
	}
}

function findStream(target, streams) {
	for(const stream of streams) {
		if(target.equals(stream)) {
			return stream;
		}
	}
}