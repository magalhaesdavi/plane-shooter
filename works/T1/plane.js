import * as THREE from  'three';
import { degreesToRadians } from '../../libs/util/util.js';

{/**
    Classe referente ao objeto que controla as
    funcionalidades do avião.
*/}
export class Airplane {
    constructor() {
        this.geometry = new THREE.ConeGeometry( 2, 3, 32 );
        this.material = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
        this.cone = new THREE.Mesh( this.geometry, this.material );
        this.boundingBox = new THREE.Box3().setFromObject(this.cone);
        this.shootPermission = false;
        this.startTime = new Date();
    }

    update(speed) {
        let endTime = new Date();
        if(endTime - this.startTime > 100) {
            this.shootPermission = true;
            this.startTime = new Date();
        }
        this.cone.translateY(speed);
        this.boundingBox.copy(this.cone.geometry.boundingBox).applyMatrix4(this.cone.matrixWorld);
    }

    setInitialOrResetPosition(initial = true) {
        this.cone.position.set(0, 5, 50);
        if (initial) {
            this.cone.rotateX(degreesToRadians(-90));
        }
    }

    bullet(speed, airplane, game) {
        if(this.shootPermission){
            let bullet = new Bullet(speed);
            bullet.create(airplane);
            game.addOnScene(bullet.sphere);
            this.shootPermission = false;
            return bullet;
        }
        else {
            return null;
        }
    }
}

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
