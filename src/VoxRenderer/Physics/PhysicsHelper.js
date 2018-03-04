import * as THREE from 'three';
import 'three/examples/js/libs/ammo';

export default class PhysicsHelper {

    static createMesh(geometry) {
        const triangles = [];
        let face = null;
        const vertices = geometry.vertices;

        for (let i = 0; i < geometry.faces.length; i++ ) {
			face = geometry.faces[i];
			if ( face instanceof THREE.Face3) {

				triangles.push([
					{ x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
					{ x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
					{ x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z }
				]);

			} else if ( face instanceof THREE.Face4 ) {

				triangles.push([
					{ x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
					{ x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
					{ x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z }
				]);
				triangles.push([
					{ x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
					{ x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z },
					{ x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z }
				]);

			}
        }

        const _vec3_1 = new Ammo.btVector3(0,0,0);
	    const _vec3_2 = new Ammo.btVector3(0,0,0);
	    const _vec3_3 = new Ammo.btVector3(0,0,0);
        const triangle_mesh = new Ammo.btTriangleMesh();

        for (let i = 0; i < triangles.length; i++ ) {
            let triangle = triangles[i];

            _vec3_1.setX(triangle[0].x);
            _vec3_1.setY(triangle[0].y);
            _vec3_1.setZ(triangle[0].z);

            _vec3_2.setX(triangle[1].x);
            _vec3_2.setY(triangle[1].y);
            _vec3_2.setZ(triangle[1].z);

            _vec3_3.setX(triangle[2].x);
            _vec3_3.setY(triangle[2].y);
            _vec3_3.setZ(triangle[2].z);

            triangle_mesh.addTriangle(
                _vec3_1,
                _vec3_2,
                _vec3_3,
                true
            );
        }

        const shape = new Ammo.btBvhTriangleMeshShape(
            triangle_mesh,
            true,
            true
        );

        if(!geometry.boundingBox) {
            geometry.computeBoundingBox();
        }

        const center =  new THREE.Vector3(0,0,0);

        return { shape, center };
    }

    static createSphere(geometry, margin = 0.05) {

        if(!geometry.boundingSphere) {
            geometry.computeBoundingSphere();
        }

        var shape = new Ammo.btSphereShape(geometry.boundingSphere.radius);
        shape.setMargin( margin );

        const center =  geometry.center();

        return { shape, center };
    }

    static createBox(geometry, margin = 0.05) {

        if(!geometry.boundingBox) {
            geometry.computeBoundingBox();
        }

        const size = geometry.boundingBox.getSize();

        const center =  geometry.center();

        var shape = new Ammo.btBoxShape( new Ammo.btVector3( size.x * 0.5, size.y * 0.5, size.z * 0.5 ) );
        shape.setMargin( margin );

        return { shape, center };
    }
}