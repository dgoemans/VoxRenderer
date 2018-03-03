import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/modifiers/SimplifyModifier';
import VoxModelLoader from './VoxModelLoader';
import Lamp from './Lamp';
import Road from './Road';

import 'three/examples/js/shaders/DepthLimitedBlurShader.js';
import 'three/examples/js/shaders/UnpackDepthRGBAShader.js';

import 'three/examples/js/shaders/SAOShader.js';
import 'three/examples/js/shaders/CopyShader.js';

import 'three/examples/js/postprocessing/EffectComposer.js';
import 'three/examples/js/postprocessing/RenderPass.js';
import 'three/examples/js/postprocessing/ShaderPass.js';
import 'three/examples/js/postprocessing/MaskPass.js';
import 'three/examples/js/postprocessing/SAOPass.js';

export default class VoxRenderer {
    constructor() {
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 2048 );

        this.lightOffset = new THREE.Vector3(100,200,150);
        

        this.scene = new THREE.Scene();

        this.scene.fog = new THREE.FogExp2( 0x1f2125, 0.0035 );

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setClearColor(0x05081f, 1);
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.controls = new THREE.OrbitControls( this.camera );
        
        this.camera.position.set(0, 90, 90);
        this.camera.lookAt(new THREE.Vector3(0,0,0))

        this.ambient = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(this.ambient);

        this.raycaster = new THREE.Raycaster();

        new Lamp(this.scene, new THREE.Vector3(-44.5,0, -44.5));
        new Lamp(this.scene, new THREE.Vector3(35.5,0, 35.5));
        new Lamp(this.scene, new THREE.Vector3(-44.5,0, -344.5));
        new Lamp(this.scene, new THREE.Vector3(35.5,0, -235.5));

        for(let i=-480; i<480; i+=40) {
            new Road(this.scene, new THREE.Vector3(-20, 0, i));            
        }

        this.loadVoxModel('../ignoremodels/monu6.vox', new THREE.Vector3(-60,0,50), new THREE.Euler(0,Math.PI, 0));
        this.loadVoxModel('../ignoremodels/monu7.vox', new THREE.Vector3(-60,0,-70), new THREE.Euler(0,Math.PI, 0));
        this.loadVoxModel('../ignoremodels/monu6.vox', new THREE.Vector3(-250,0,-150), new THREE.Euler(0,0, 0));
        this.loadVoxModel('../ignoremodels/monu6.vox', new THREE.Vector3(-150,0,-250), new THREE.Euler(0,Math.PI/2, 0));
        this.loadVoxModel('../ignoremodels/monu6.vox', new THREE.Vector3(-30,-4,60), new THREE.Euler(0,-Math.PI/2, 0));
        
        this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,0), new THREE.Euler(0,0, 0));
        this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,-100), new THREE.Euler(0,0, 0));
        this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,-200), new THREE.Euler(0,0, 0));
        this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,-300), new THREE.Euler(0,0, 0));
        this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,100), new THREE.Euler(0,0, 0));
        this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,-400), new THREE.Euler(0,0, 0));
        this.loadVoxModel('../ignoremodels/%23brick_wall.vox', new THREE.Vector3(-250,0,-500), new THREE.Euler(0,0, 0));
        
        const floorGeometry = new THREE.PlaneBufferGeometry(1024, 1024, 128, 128);
        floorGeometry.rotateX(-Math.PI/2);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333, 
            metalness: 0, 
            flatShading: true,
            roughness: 1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.floor = floor;

        document.body.appendChild( this.renderer.domElement );

        this.initPostprocessing();
    }

    async loadVoxModel(path, position, rotation) {
        const meshes = await new VoxModelLoader().load(path, position, rotation);
        meshes.forEach(mesh => this.scene.add(mesh));
    }

    

    initPostprocessing() {
        const { width, height } = this.renderer.getSize();
        
        this.effectComposer = new THREE.EffectComposer( this.renderer );

        const renderPass = new THREE.RenderPass( this.scene, this.camera );
        this.effectComposer.addPass( renderPass );

        var params = {
            output: THREE.SAOPass.OUTPUT.Default,
            saoBias: 0.3,
            saoIntensity: 1.00,
            saoScale: 900,
            saoKernelRadius: 50,
            saoMinResolution: 0.00025,
            saoBlur: true,
            saoBlurRadius: 25,
            saoBlurStdDev: 5,
            saoBlurDepthCutoff: 0.0001
        }

        const saoPass = new THREE.SAOPass(this.scene, this.camera, false, true);
        saoPass.params = params;
        saoPass.renderToScreen = true;
        this.effectComposer.addPass(saoPass);

        
        var pixelRatio = this.renderer.getPixelRatio();
        var newWidth  = Math.floor( width / pixelRatio ) || 1;
        var newHeight = Math.floor( height / pixelRatio ) || 1;
        this.effectComposer.setSize( newWidth, newHeight );
    }

    update() {
        this.controls.update();
    }

    render() {
        this.effectComposer.render();
    }
}