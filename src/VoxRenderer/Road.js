import * as THREE from 'three';
import VoxModelLoader from './VoxModelLoader';

export default class Road {

    constructor(parent, position, rotation) {
        this.loadModel(parent, position, rotation);
    }

    async loadModel(parent, position, rotation) {
        const voxLoader = new VoxModelLoader();
        const mesh = await voxLoader.load('../models/road.vox', position, rotation);

        parent.addToScene(mesh);
    }
}