import * as THREE from 'three';
import VoxModelLoader from '../VoxModel/VoxModelLoader';
import PhysicsHelper from '../Physics/PhysicsHelper';

export default class Lamp {

    constructor(parent, position, rotation) {
        this.pointLight = new THREE.PointLight(0xcccccc, 1, 150, 2);
        this.pointLight.castShadow = true;
        this.pointLight.shadow.bias = -0.0001;
        this.pointLight.shadow.radius = 15;
        this.pointLight.shadow.mapSize.width = 512;
        this.pointLight.shadow.mapSize.width = 512;

        this.pointLight.position.set(4.5,25,4.5);
        parent.addToScene(this.pointLight);

        this.loadModel(parent, position, rotation);
    }

    async loadModel(parent, position, rotation) {
        const voxLoader = new VoxModelLoader();
        const mesh = await voxLoader.load('../models/lamp.vox', position, rotation);

        mesh.castShadow = false;
        mesh.material[2].emissive = new THREE.Color(0xffffff);
        mesh.material[2].emissiveIntensity = 20;
        mesh.material[2].transparent = true;
        mesh.material[2].opacity = 0.7;
        mesh.material[2].shadowSide = THREE.FrontSide;

        mesh.material[254].shadowSide = THREE.BackSide;


        this.pointLight.parent = mesh;

        parent.addToScene(mesh, 0);
    }
}