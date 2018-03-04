import * as THREE from 'three';
import Lamp from "../Objects/Lamp";
import Ball from "../Objects/Ball";
import Road from "../Objects/Road";
import PhysicsHelper from '../Physics/PhysicsHelper';

export default class Level {
    constructor(renderer, physics) {

        this.physics = physics;
        this.renderer = renderer;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2( 0x1f2125, 0.0035 );

        this.ambient = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(this.ambient);
        
        const floorGeometry = new THREE.BoxGeometry(1024, 1, 1024);
        const {shape, center} = PhysicsHelper.createBox(floorGeometry);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333, 
            metalness: 0, 
            flatShading: true,
            roughness: 1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.userData.physicsShape = shape;
        floor.userData.physicsCenter = center;
        floor.receiveShadow = true;
        floor.position.set(0,-0.5,0);
        this.addToScene(floor, 0, 0.5);

        new Lamp(this, new THREE.Vector3(-44.5,0, -44.5));
        new Lamp(this, new THREE.Vector3(35.5,0, 35.5));
        new Lamp(this, new THREE.Vector3(-44.5,0, -344.5));
        new Lamp(this, new THREE.Vector3(35.5,0, -235.5));

        for(let i=-480; i<480; i+=40) {
            new Road(this, new THREE.Vector3(-20, 0, i));            
        }
    }
    
    addToScene(mesh, mass = 1, restitution = 0) {
        this.scene.add(mesh);
        mesh.userData.physicsShape && this.physics.createRigidBody(mesh, mass, restitution);
        this.renderer.shadowMap.needsUpdate = true;
    }

    addBall() {
        const angle = Math.random() * Math.PI * 2
        const radius = 20;
        const x = radius*Math.cos(angle);
        const z = radius*Math.sin(angle);
        new Ball(this, new THREE.Vector3(x,105,z));
    }

    update(delta, totalElapsed) {
        
        if(totalElapsed > 5 && Math.random() < 0.05) {
            this.addBall();
        }
    }
}