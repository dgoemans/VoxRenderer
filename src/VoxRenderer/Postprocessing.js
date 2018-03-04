import * as THREE from 'three';
import 'three/examples/js/shaders/DepthLimitedBlurShader.js';
import 'three/examples/js/shaders/UnpackDepthRGBAShader.js';

import 'three/examples/js/shaders/SAOShader.js';
import 'three/examples/js/shaders/CopyShader.js';

import 'three/examples/js/postprocessing/EffectComposer.js';
import 'three/examples/js/postprocessing/RenderPass.js';
import 'three/examples/js/postprocessing/ShaderPass.js';
import 'three/examples/js/postprocessing/MaskPass.js';
import 'three/examples/js/postprocessing/SAOPass.js';

export default class Postprocessing {
    constructor(renderer, camera, scene) {
        const { width, height } = renderer.getSize();
        
        this.effectComposer = new THREE.EffectComposer( renderer );

        const renderPass = new THREE.RenderPass( scene, camera );
        this.effectComposer.addPass( renderPass );

        var params = {
            output: THREE.SAOPass.OUTPUT.Default,
            saoBias: 0.1,
            saoIntensity: 1.00,
            saoScale: 900,
            saoKernelRadius: 50,
            saoMinResolution: 0.00025,
            saoBlur: true,
            saoBlurRadius: 25,
            saoBlurStdDev: 5,
            saoBlurDepthCutoff: 0.0001
        }

        const saoPass = new THREE.SAOPass(scene, camera, false, true);
        saoPass.params = params;
        saoPass.renderToScreen = true;
        this.effectComposer.addPass(saoPass);

        
        var pixelRatio = renderer.getPixelRatio();
        var newWidth  = Math.floor( width / pixelRatio ) || 1;
        var newHeight = Math.floor( height / pixelRatio ) || 1;
        this.effectComposer.setSize( newWidth, newHeight );
    }

    render() {
        this.effectComposer.render();
    }
}