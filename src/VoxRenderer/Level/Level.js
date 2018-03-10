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

        this.roadTextures = {
            Straight: new THREE.TextureLoader().load('./textures/road_straight.png'),
            Corner: new THREE.TextureLoader().load('./textures/road_corner.png'),
        };
    }

    onWheel(delta) {
        this.controls.zoom(delta);
    }

    onMouseDown(pos) {
        this.editMode.activate(this.currentIntersection, this, pos);
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
        this.editMode.deactivate(this.currentIntersection, this, pos);
    }

    onKeyDown(keycode) {
        switch ( keycode ) {
            case 38: // up
                this.controls.move(Directions.Forward);
                break;
            case 37: // left
                this.controls.move(Directions.Left);
                break;
            case 40: // down
                this.controls.move(Directions.Backward);
                break;
            case 39: // right
                this.controls.move(Directions.Right);
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
                break;
        }
    }

    onKeyUp(keycode) {
        switch( keycode ) {
            case 38: // up
                this.controls.stop(Directions.Forward);
                break;
            case 37: // left
                this.controls.stop(Directions.Left);
                break;
            case 40: // down
                this.controls.stop(Directions.Backward);
                break;
            case 39: // right
                this.controls.stop(Directions.Right);
                break;
        }
    }

    getIntersects(pos, object) {
        this.raycaster.setFromCamera(pos, this.camera);
        return this.raycaster.intersectObject(object);
    }

    tilesSelected(tiles) {
        const geometry = new THREE.Geometry();
        const floorGeometry = this.terrain.mesh.geometry;

        let index = 0;

        tiles.forEach((tile, i) => {
            tile.vertices.forEach(vertex => {
                const newVertex = floorGeometry.vertices[vertex].clone();
                newVertex.applyEuler(this.terrain.mesh.rotation);
                geometry.vertices.push(newVertex);
            });

            const uvs = this.getUvs(tiles, i);
            uvs.forEach(uv => geometry.faceVertexUvs[0].push(uv));

            geometry.faces.push( new THREE.Face3(index, index+1, index+2));
            geometry.faces.push( new THREE.Face3(index+2, index+1, index+3));
            geometry.faces.forEach(face => face.materialIndex = 0);

            index += 4;
        });

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        const straight = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            flatShading: true,
            roughness: 1.0,
            metalness: 0.0,
            clearCoat: 0.0,
            clearCoatRoughness: 1.0,
            reflectivity: 0.0,
            transparent: true,
            opacity: 1.0,
            map: this.roadTextures.Straight,
        });

        const corner = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            flatShading: true,
            roughness: 1.0,
            metalness: 0.0,
            clearCoat: 0.0,
            clearCoatRoughness: 1.0,
            reflectivity: 0.0,
            transparent: true,
            opacity: 1.0,
            map: this.roadTextures.Straight,
        });

        const mesh = new THREE.Mesh(geometry, [straight, corner]);
        this.scene.add(mesh);
    }

    getUvs(tiles, index) {
        const tile = tiles[index];
        const prev = (index > 0) ? tiles[index-1] : tile;;
        const next = (index+1 < tiles.length) ? tiles[index+1] : tile;

        const uvs = [];

        if(prev.y === tile.y && tile.y === next.y) {
            uvs.push([new THREE.Vector2(0,0),
                new THREE.Vector2(1,0),
                new THREE.Vector2(0,1)]);
    
            uvs.push([new THREE.Vector2(0,1),
                    new THREE.Vector2(1,0),
                    new THREE.Vector2(1,1)]);    
        } else if(prev.x === tile.x && tile.x === next.x) {
            uvs.push([new THREE.Vector2(0,0),
                new THREE.Vector2(0,1),
                new THREE.Vector2(1,0)]);
    
            uvs.push([new THREE.Vector2(1,0),
                    new THREE.Vector2(0,1),
                    new THREE.Vector2(1,1)]);
        }

        return uvs;
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
        this.editMode && this.editMode.update(delta);
        this.controls.update(delta);
    }
}