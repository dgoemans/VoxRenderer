import './index.html';
import './style.css';

global.THREE = {};

import VoxRenderer from './VoxRenderer/VoxRenderer';

class App {
    constructor() {
        this.lastFrameTime = Date.now();
        this.voxRenderer = new VoxRenderer();

        this.mainLoop();
    }
    
    mainLoop = () => {
        const thisFrameTime = Date.now();
        const delta = thisFrameTime - this.lastFrameTime

        this.voxRenderer.update(delta);
        this.voxRenderer.render();

        this.lastFrameTime = thisFrameTime;

        requestAnimationFrame( this.mainLoop );

    }
};

new App();