import * as THREE from 'three';
import VoxModelLoader from './VoxModelLoader';

export default class Road {

    constructor(scene, position, rotation) {
        this.loadModel(scene, position, rotation);
    }

    async loadModel(scene, position, rotation) {
        const voxLoader = new VoxModelLoader();
        const mesh = await voxLoader.load('../models/road.vox', position, rotation);

        scene.add(mesh[0]);
    }
}