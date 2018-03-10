import * as THREE from 'three';

import Postprocessing from './Postprocessing';
import Physics from './Physics/Physics';
import PhysicsHelper from './Physics/PhysicsHelper';
import Level from './Level/Level';
import Input from './Input';

const SHADOW_REFRESH_TIME = 0.01;

export default class VoxRenderer {
    
    constructor() {
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 2048 );

        this.renderer = new THREE.WebGLRenderer( { antialias: false } );
        this.renderer.setClearColor(0x05081f, 1);
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.powerPreference = 'high-performance';
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.toneMapping = THREE.Uncharted2ToneMapping;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.physics = new Physics();

        document.body.appendChild( this.renderer.domElement );

        this.level = new Level(this.renderer, this.physics, this.camera);

        this.input = new Input(this.level);

        this.shadowRefreshTimer = SHADOW_REFRESH_TIME;

        this.postprocessingRenderer = new Postprocessing(this.renderer, this.camera, this.level.scene);
    }

    update(delta, totalElapsed) {
        this.input.update(delta);
        this.physics.update(delta);

        this.level.update(delta, totalElapsed);

        this.shadowRefreshTimer -= delta;

        if(this.shadowRefreshTimer < 0) {
            this.shadowRefreshTimer = SHADOW_REFRESH_TIME;
            this.renderer.shadowMap.needsUpdate = true;
        }
    }

    render() {
        this.postprocessingRenderer.render();
    }
}