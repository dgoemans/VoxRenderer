import * as THREE from 'three';
import Lamp from "../Objects/Lamp";
import Ball from "../Objects/Ball";
import Road from "../Objects/Road";
import Tree from "../Objects/Tree";
import PhysicsHelper from '../Physics/PhysicsHelper';
import VoxModelLoader from '../VoxModel/VoxModelLoader';

import SimplexNoise from 'simplex-noise';
import TreeGrid from '../Objects/TreeGrid';

export default class Level {
    constructor(renderer, physics) {

        this.physics = physics;
        this.renderer = renderer;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2( 0x1f2125, 0.0015 );

        const light = new THREE.HemisphereLight( 0xfafaff, 0xffffff, 0.5 );
        this.scene.add( light );

        const floorGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);

        var simplex = new SimplexNoise(Math.random);
        
        floorGeometry.faces.forEach(face => {

            const vertA = floorGeometry.vertices[face.a];
            const vertB = floorGeometry.vertices[face.b];
            const vertC = floorGeometry.vertices[face.c];

            const vert = new THREE.Vector3();
            vert.addVectors(vertA, vertB);
            vert.divideScalar(2);

            const exponent = 0.79;
            const scale = 100;
            const e = 1 * simplex.noise2D(1 * vert.x/scale, 1 * vert.y/scale) +
                0.5 * simplex.noise2D(2 * vert.x/scale, 2 * vert.y/scale) +
                0.25 * simplex.noise2D(4 * vert.x/scale, 4 * vert.y/scale);

            vertA.z = vertB.z = vertC.z = e*7;

            let value = (simplex.noise2D(1 * vert.x/scale, 1 * vert.y/scale) + Math.random())/2;

            if(value > 0.7) {
                new TreeGrid(this, new THREE.Vector3(vertA.x, vertA.z, -vertA.y));
            }
        });

        //const {shape, center} = PhysicsHelper.createBox(floorGeometry);
        const floorMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x33dd33, 
            flatShading: true,
            roughness: 1.0,
            metalness: 0.0,
            clearCoat: 0.0,
            clearCoatRoughness: 1.0,
            reflectivity: 0.0
        });

        const floorHighlightMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x55ff55, 
            flatShading: true,
            roughness: 1.0,
            metalness: 0.0,
            clearCoat: 0.0,
            clearCoatRoughness: 1.0,
            reflectivity: 0.0
        });

        this.floor = new THREE.Mesh(floorGeometry, [floorMaterial, floorHighlightMaterial]);
        this.floor.rotateX(-Math.PI/2);
        this.addToScene(this.floor, 0, 0.5);
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