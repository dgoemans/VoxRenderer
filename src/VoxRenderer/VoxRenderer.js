import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/modifiers/SimplifyModifier';
import VoxModelLoader from './VoxModelLoader';

import 'three/examples/js/shaders/DepthLimitedBlurShader.js'
import 'three/examples/js/shaders/UnpackDepthRGBAShader.js'

import 'three/examples/js/shaders/SAOShader.js'
import 'three/examples/js/shaders/CopyShader.js'

import 'three/examples/js/postprocessing/EffectComposer.js'
import 'three/examples/js/postprocessing/RenderPass.js'
import 'three/examples/js/postprocessing/ShaderPass.js'
import 'three/examples/js/postprocessing/MaskPass.js'
import 'three/examples/js/postprocessing/SAOPass.js'

export default class VoxRenderer {
    constructor() {
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 2048 );

        this.lightOffset = new THREE.Vector3(100,200,50);
        

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setClearColor(0x5588ff, 1);
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.controls = new THREE.OrbitControls( this.camera );
        
        this.camera.position.set(0, 90, 90);
        this.camera.lookAt(new THREE.Vector3(0,0,0))

        this.ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambient);

        this.raycaster = new THREE.Raycaster();
        
        const shadowWidth = 200;
        const shadowMapSize = 4096;
        this.sun = new THREE.DirectionalLight(0xffffff, 0.4);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.width = shadowMapSize;
        this.sun.shadow.mapSize.height = shadowMapSize;
        this.sun.shadow.camera.left = -shadowWidth;
        this.sun.shadow.camera.bottom = -shadowWidth;
        this.sun.shadow.camera.right = shadowWidth;
        this.sun.shadow.camera.top = shadowWidth;
        this.sun.shadow.camera.near = 0.5;
        this.sun.shadow.camera.far = 2048;
        this.sun.shadow.radius = 2.0;
        this.sun.shadow.bias = 0.00001;
        this.scene.add(this.sun);
        this.scene.add(this.sun.target);

        //const helper = new THREE.CameraHelper( this.sun.shadow.camera );
        //this.scene.add( helper );

        const floorGeometry = new THREE.PlaneBufferGeometry(1024, 1024, 128, 128);
        floorGeometry.rotateX(-Math.PI/2);
        const floorMaterial = new THREE.MeshStandardMaterial({color: 0xffff00, metalness: 0, flatShading: true });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.floor = floor;

        document.body.appendChild( this.renderer.domElement );

        this.initPostprocessing();
        
        this.voxLoader = new VoxModelLoader();

        this.loadVoxModel('../models/ephtracy.vox', new THREE.Vector3(0,0,0));
        this.loadVoxModel('../models/bowl_bone2.vox', new THREE.Vector3(40,0,0));
        //this.loadVoxModel('../models/test.vox', new THREE.Vector3(40,0,0));
        this.loadVoxModel('../models/castle.vox', new THREE.Vector3(-40,0,0));
        this.loadVoxModel('../models/monu6.vox', new THREE.Vector3(-40,0,-30), new THREE.Euler(0, Math.PI, 0));
        this.loadVoxModel('../models/teapot.vox', new THREE.Vector3(40,0,-60));
        this.loadVoxModel('../models/dragon.vox', new THREE.Vector3(0,0,-150));
    }

    async loadVoxModel(path, position, rotation) {
        const meshes = await this.voxLoader.load(path, position, rotation);
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

        this.raycaster.setFromCamera(new THREE.Vector2(0,0), this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, false);

        if(intersects.length) {
            this.sun.position.copy(intersects[0].point);
            this.sun.position.add(this.lightOffset);
            this.sun.target.position.copy(intersects[0].point);
        }
    }

    render() {
        this.effectComposer.render();
    }
}