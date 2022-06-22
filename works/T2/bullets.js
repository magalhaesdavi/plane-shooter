import * as THREE from  'three';
import { degreesToRadians } from '../../libs/util/util.js';

{/**
    Classe referente ao objeto que controla as
    funcionalidades dos projetes que o avião atira'.
*/}
export class Bullet {
    constructor(speed) {
        this.geometry = new THREE.SphereGeometry( 0.75, 32, 32 );
        this.material = new THREE.MeshLambertMaterial( { color: 0xffa500 } );
        this.sphere = new THREE.Mesh( this.geometry, this.material );
        this.speed = speed * 2.25;
        this.boundingBox = new THREE.Box3().setFromObject(this.sphere);
        // this.sphere.geometry.computeBoundingBox();
        return;
    }

    create(airplane) {
        this.sphere.position.set(
            airplane.cone.position.x,
            airplane.cone.position.y,
            airplane.cone.position.z - 5
        );
        return;
    }

    update() {
        this.sphere.translateZ(-this.speed);
        this.boundingBox.copy(this.sphere.geometry.boundingBox).applyMatrix4(this.sphere.matrixWorld);
    }
}
