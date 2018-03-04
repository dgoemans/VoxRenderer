import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/modifiers/SimplifyModifier';
import VoxModelLoader from './VoxModelLoader';
import Lamp from './Lamp';
import Road from './Road';

import Postprocessing from './Postprocessing';
import Physics from './Physics';
import PhysicsHelper from './PhysicsHelper';
import Ball from './Ball';

export default class VoxRenderer {
    constructor() {
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 2048 );

        this.lightOffset = new THREE.Vector3(100,200,150);
        

        this.scene = new THREE.Scene();

        this.scene.fog = new THREE.FogExp2( 0x1f2125, 0.0035 );

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

        this.ambient = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(this.ambient);

        this.raycaster = new THREE.Raycaster();

        new Lamp(this, new THREE.Vector3(-44.5,0, -44.5));
        new Lamp(this, new THREE.Vector3(35.5,0, 35.5));
        new Lamp(this, new THREE.Vector3(-44.5,0, -344.5));
        new Lamp(this, new THREE.Vector3(35.5,0, -235.5));

        for(let i=-480; i<480; i+=40) {
            new Road(this, new THREE.Vector3(-20, 0, i));            
        }

        // this.loadVoxModel('../ignoremodels/monu6.vox', new THREE.Vector3(-60,0,50), new THREE.Euler(0,Math.PI, 0));
        // this.loadVoxModel('../ignoremodels/monu7.vox', new THREE.Vector3(-60,0,-70), new THREE.Euler(0,Math.PI, 0));
        // this.loadVoxModel('../ignoremodels/monu6.vox', new THREE.Vector3(-250,0,-150), new THREE.Euler(0,0, 0));
        // this.loadVoxModel('../ignoremodels/monu6.vox', new THREE.Vector3(-150,0,-250), new THREE.Euler(0,Math.PI/2, 0));
        // this.loadVoxModel('../ignoremodels/monu6.vox', new THREE.Vector3(-30,-4,60), new THREE.Euler(0,-Math.PI/2, 0));
        
        // this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,0), new THREE.Euler(0,0, 0));
        // this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,-100), new THREE.Euler(0,0, 0));
        // this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,-200), new THREE.Euler(0,0, 0));
        // this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,-300), new THREE.Euler(0,0, 0));
        // this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,100), new THREE.Euler(0,0, 0));
        // this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,-400), new THREE.Euler(0,0, 0));
        // this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,-500), new THREE.Euler(0,0, 0));
        
        const floorGeometry = new THREE.BoxGeometry(1024, 1, 1024);
        const physicsShape = PhysicsHelper.createBox(floorGeometry);
        //floorGeometry.rotateX(-Math.PI/2);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333, 
            metalness: 0, 
            flatShading: true,
            roughness: 1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.userData.physicsShape = physicsShape;
        floor.receiveShadow = true;
        floor.position.set(0,-0.5,0);
        this.addToScene(floor, 0, 0.5);

        document.body.appendChild( this.renderer.domElement );

        this.postprocessingRenderer = new Postprocessing(this.renderer, this.camera, this.scene);
    }

    addBall() {
        const angle = Math.random() * Math.PI * 2
        const radius = 20;
        const x = radius*Math.cos(angle);
        const z = radius*Math.sin(angle);
        new Ball(this, new THREE.Vector3(x,45,z));
    }

    async loadVoxModel(path, position, rotation) {
        const mesh = await new VoxModelLoader().load(path, position, rotation);
        this.addToScene(mesh);
    }

    addToScene(mesh, mass = 1, restitution = 0) {
        this.scene.add(mesh);
        mesh.userData.physicsShape && this.physics.createRigidBody(mesh, mass, restitution);
        this.renderer.shadowMap.needsUpdate = true;
    }

    update(delta) {
        this.controls.update();
        this.physics.update(delta);

        if(Math.random() < 0.01) {
            this.addBall();
        }
    }

    render() {
        this.postprocessingRenderer.render();
    }
}