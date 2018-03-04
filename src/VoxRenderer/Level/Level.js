import * as THREE from 'three';
import Lamp from "../Objects/Lamp";
import Ball from "../Objects/Ball";
import Road from "../Objects/Road";
import PhysicsHelper from '../Physics/PhysicsHelper';
import VoxModelLoader from '../VoxModel/VoxModelLoader';

export default class Level {
    constructor(renderer, physics) {

        this.physics = physics;
        this.renderer = renderer;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2( 0x1f2125, 0.0015 );

        const light = new THREE.HemisphereLight( 0xfafaff, 0xffffff, 0.1 );
        this.scene.add( light );
        
        const floorGeometry = new THREE.BoxGeometry(4096, 1, 4096);
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

        
        for(let i=-480; i<480; i+=40) {
            new Road(this, new THREE.Vector3(-20, 0, i));            
        }

        this.addLamps();
        this.addBuildings();
    }

    async addLamps() {
        for(let i=-1000; i <= 1000; i+= 280) {
            await new Lamp(this, new THREE.Vector3(-44.5,0, i - 44.5));
            await new Lamp(this, new THREE.Vector3(35.5,0, i + 35.5));
        }
    }

    async addBuildings() {
        for(let i=-2000; i <= 2000; i+= 150) {
            await this.loadVox('building_1', new THREE.Vector3(-200,0,i));
            await this.loadVox('building_1', new THREE.Vector3(63,0,i));
        }        
    }

    async loadVox(model, position, rotation) {
        position = position || new THREE.Vector3();
        rotation = rotation || new THREE.Euler();
        const voxLoader = new VoxModelLoader();
        const mesh = await voxLoader.load(`../models/${model}.vox`, position, rotation);
        this.addToScene(mesh, 0);
    }
    
    addToScene(mesh, mass = 1, restitution = 0) {
        this.scene.add(mesh);
        mesh.userData.physicsShape && this.physics.createRigidBody(mesh, mass, restitution);
        this.renderer.shadowMap.needsUpdate = true;
    }

    addBall(position) {
        return new Ball(this, position);
    }

    update(delta, totalElapsed) {
        /*if(totalElapsed > 5 && totalElapsed < 30 && Math.random() < 0.05) {
            const angle = Math.random() * Math.PI * 2
            const radius = 20;
            const x = radius*Math.cos(angle);
            const z = radius*Math.sin(angle);
            this.addBall(new THREE.Vector3(x,105,z));
        }*/
    }
}