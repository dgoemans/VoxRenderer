import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/modifiers/SimplifyModifier';
import Lamp from './Objects/Lamp';
import Road from './Objects/Road';
import Ball from './Objects/Ball';

import Postprocessing from './Postprocessing';
import Physics from './Physics/Physics';
import PhysicsHelper from './Physics/PhysicsHelper';
import Level from './Level/Level';

const SHADOW_REFRESH_TIME = 0.1;

export default class VoxRenderer {
    
    constructor() {
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 2048 );

        this.lightOffset = new THREE.Vector3(100,200,150);
        
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setClearColor(0x05081f, 1);
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.physics = new Physics();
        
        this.controls = new THREE.OrbitControls( this.camera );
        
        this.camera.position.set(0, 90, 90);
        this.camera.lookAt(new THREE.Vector3(0,0,0));

        this.raycaster = new THREE.Raycaster();

        document.body.appendChild( this.renderer.domElement );

        this.level = new Level(this.renderer, this.physics);

        this.shadowRefreshTimer = SHADOW_REFRESH_TIME;

        this.postprocessingRenderer = new Postprocessing(this.renderer, this.camera, this.level.scene);
    }

    update(delta, totalElapsed) {
        this.controls.update();
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