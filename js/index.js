import { Electron } from './app.js';

const app = new Electron();
document.body.append(app.canvas);
app.start();
