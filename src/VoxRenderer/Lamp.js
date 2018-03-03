import * as THREE from 'three';
import VoxModelLoader from './VoxModelLoader';

export default class Lamp {

    constructor(scene, position, rotation) {
        const pointLight = new THREE.PointLight(0xcccccc, 0.7, 150, 2);
        pointLight.castShadow = true;
        pointLight.position.set(4.5,25,4.5);
        scene.add(pointLight);

        this.loadModel(scene, position, rotation);
    }

    async loadModel(scene, position, rotation) {
        const voxLoader = new VoxModelLoader();
        const mesh = await voxLoader.load('../models/lamp.vox', position, rotation);
        
        mesh[1].castShadow = false;
        mesh[1].material[2].emissive = new THREE.Color(0xffffff);
        mesh[1].material[2].metalness = 1;
        mesh[1].material[2].roughness = 0;

        scene.add(mesh[0]);
        scene.add(mesh[1]);
    }
}