import './index.html';
import './style.css';

global.THREE = {};

import VoxRenderer from './VoxRenderer/VoxRenderer';

class App {
    constructor() {
        this.lastFrameTime = Date.now();
        this.voxRenderer = new VoxRenderer();

        this.totalElapsed = 0;

        this.mainLoop();
    }
    
    mainLoop = () => {
        const thisFrameTime = Date.now();
        const delta = (thisFrameTime - this.lastFrameTime)/1000;
        this.totalElapsed += delta;

        this.voxRenderer.update(delta, this.totalElapsed);
        this.voxRenderer.render();

        this.lastFrameTime = thisFrameTime;

        requestAnimationFrame( this.mainLoop );

    }
};

new App();