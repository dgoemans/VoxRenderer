import * as THREE from 'three';
import Lamp from "../Objects/Lamp";
import Ball from "../Objects/Ball";
import Road from "../Objects/Road";
import Tree from "../Objects/Tree";
import PhysicsHelper from '../Physics/PhysicsHelper';
import VoxModelLoader from '../VoxModel/VoxModelLoader';

import SimplexNoise from 'simplex-noise';
import TreeGrid from '../Objects/TreeGrid';
import Terrain from '../Objects/Terrain';
import EditMode from './EditMode/EditMode';

export default class Level {
    constructor(renderer, physics, camera) {

        this.physics = physics;
        this.renderer = renderer;
        this.camera = camera;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2( 0x1f2125, 0.0015 );

        const light = new THREE.HemisphereLight( 0xfafaff, 0xffffff, 0.5 );
        this.scene.add( light );

        this.terrain = new Terrain(this);
        
        this.riseTime = 0.2;
        this.riseTimer = this.riseTime;

        this.mouseDown = false;

        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        this.editMode = EditMode.RaiseTerrain;

        this.currentIntersection = null;
        this.raycaster = new THREE.Raycaster();
    }

    onMouseDown(pos) {
        this.mouseDown = true;
    }

    onMouseMove(pos) {
        const intersects = this.getIntersects(pos, this.terrain.mesh);
        if (intersects.length > 0) {

            const mesh = intersects[0].object;
            const geometry = mesh.geometry;

            if(this.currentIntersection) {
                this.currentIntersection.grid.faces.forEach(face => geometry.faces[face].materialIndex = 0);
                this.currentIntersection.geometry.groupsNeedUpdate = true;
            }

            const grid = this.terrain.getGrid(intersects[0].point.x, intersects[0].point.z);

            grid.faces.forEach(face => geometry.faces[face].materialIndex = 1);

            mesh.geometry.verticesNeedUpdate = true;
            mesh.geometry.groupsNeedUpdate = true;

            this.currentIntersection = {
                geometry: geometry,
                grid:  grid
            }
        }
    }

    onMouseUp(pos) {
        this.mouseDown = false;
    }

    onKeyDown(keycode) {
        switch ( keycode ) {
            case 38: // up
            case 87: // w
                this.movement.forward = true;
                break;
            case 37: // left
            case 65: // a
                this.movement.left = true; 
                break;
            case 40: // down
            case 83: // s
                this.movement.backward = true;
                break;
            case 39: // right
            case 68: // d
                this.movement.right = true;
                break;
            case 32: // space
                break;
        }
    }

    onKeyUp(keycode) {
        switch( keycode ) {
            case 38: // up
            case 87: // w
                this.movement.forward = false;
                break;
            case 37: // left
            case 65: // a
                this.movement.left = false;
                break;
            case 40: // down
            case 83: // s
                this.movement.backward = false;
                break;
            case 39: // right
            case 68: // d
                this.movement.right = false;
                break;
        }
    }

    getIntersects(pos, object) {
        this.raycaster.setFromCamera(pos, this.camera);
        return this.raycaster.intersectObject(object);
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

    }
}