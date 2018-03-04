import * as THREE from 'three';
import VoxModelLoader from './VoxModelLoader';

export default class Lamp {

    constructor(parent, position, rotation) {
        const pointLight = new THREE.PointLight(0xcccccc, 0.7, 150, 2);
        pointLight.castShadow = true;
        pointLight.position.set(4.5,25,4.5);
        parent.addToScene(pointLight);

        this.loadModel(parent, position, rotation);
    }

    async loadModel(parent, position, rotation) {
        const voxLoader = new VoxModelLoader();
        const mesh = await voxLoader.load('../models/lamp.vox', position, rotation);
        
        mesh.castShadow = true;
        mesh.material[2].emissive = new THREE.Color(0xffffff);
        mesh.material[2].metalness = 1;
        mesh.material[2].roughness = 0;

        parent.addToScene(mesh, 0);
    }
}