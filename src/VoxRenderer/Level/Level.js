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
import Controls, { Directions } from '../Controls';
import TownGenerator from './TownGenerator';

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
        
        this.mouseDown = false;

        this.editMode = EditMode.SelectPath;

        this.controls = new Controls(this.camera);

        this.currentIntersection = null;
        this.raycaster = new THREE.Raycaster();

        this.road = new Road(this);

        this.townGenerator = new TownGenerator(this);
    }

    onWheel(delta) {
        this.controls.zoom(delta);
    }

    onMouseDown(pos) {
        this.currentIntersection && this.editMode.activate(this.currentIntersection, this, pos);
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

            mesh.geometry.groupsNeedUpdate = true;

            this.currentIntersection = {
                geometry: geometry,
                grid:  grid
            };

            if(this.editMode.isActive()) {
                this.editMode.activate(this.currentIntersection, this, pos);
            }
        }
    }

    onMouseUp(pos) {
        this.currentIntersection && this.editMode.deactivate(this.currentIntersection, this, pos);
    }

    onKeyDown(keycode, shift, ctrl) {
        switch ( keycode ) {
            case 38: // up
                this.controls.move(Directions.Forward, shift);
                break;
            case 37: // left
                this.controls.move(Directions.Left, shift);
                break;
            case 40: // down
                this.controls.move(Directions.Backward, shift);
                break;
            case 39: // right
                this.controls.move(Directions.Right, shift);
                break;
            case 81: // q
                this.editMode = EditMode.RaiseTerrain;
                break;
            case 87: // w
                this.editMode = EditMode.LowerTerrain;
                break;
            case 69: // e
                this.editMode = EditMode.SmoothTerrain;
                break;
            case 65: // a
                this.editMode = EditMode.SelectPath;
                break;
            case 32: // space
                this.controls.rotate(shift ? -1 : 1);
                break;
        }
    }

    onKeyUp(keycode, shift, ctrl) {
        switch( keycode ) {
            case 38: // up
                this.controls.stop(Directions.Forward, shift);
                break;
            case 37: // left
                this.controls.stop(Directions.Left, shift);
                break;
            case 40: // down
                this.controls.stop(Directions.Backward, shift);
                break;
            case 39: // right
                this.controls.stop(Directions.Right, shift);
                break;
        }
    }

    getIntersects(pos, object) {
        this.raycaster.setFromCamera(pos, this.camera);
        return this.raycaster.intersectObject(object);
    }

    tilesSelected(tiles) {
        this.road.addTiles(tiles);
    }

    addToScene(mesh, mass = 1, restitution = 0) {
        this.scene.add(mesh);
        mesh.userData.physicsShape && this.physics.createRigidBody(mesh, mass, restitution);
        this.renderer.shadowMap.needsUpdate = true;
    }

    update(delta, totalElapsed) {
        this.editMode && this.editMode.update(delta);
        this.controls.update(delta);
    }
}