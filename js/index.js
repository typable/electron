import App from './app.js';
import { Button, Switch, XnorGate, Light, Wire } from './type.js';

let app;

let fps = 60;
let then;
let now;
let elapsed;

window.onload = function() {
	app = new App();
	window.app = app;
	
	let button = new Button(100, 50);
	app.add(button);
	let toggle = new Switch(100, 150);
	app.add(toggle);
	let gate = new XnorGate(200, 100);
	app.add(gate);
	let light = new Light(325, 125);
	app.add(light);
	app.add(new Wire(button.node[0], gate.node[1]));
	app.add(new Wire(toggle.node[0], gate.node[2]));
	app.add(new Wire(gate.node[0], light.node[0]));
	
	then = Date.now();
	requestAnimationFrame(loop);
};

function loop() {
	requestAnimationFrame(loop);
	now = Date.now();
	elapsed = now - then;
	if(elapsed > (1000 / fps)) {
		then = now - (elapsed % (1000 / fps));
		app.update();
		app.render();
	}
}
