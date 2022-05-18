import * as THREE from  'three';
import { degreesToRadians } from '../../libs/util/util.js';

{/**
    Classe referente ao objeto que controla as
    funcionalidades do avião.
*/}
export class Airplane {
    constructor() {
        this.geometry = new THREE.ConeGeometry( 2, 3, 32 );
        this.material = new THREE.MeshBasicMaterial();
        this.cone = new THREE.Mesh( this.geometry, this.material );
    }

    move(speed) {
        this.cone.translateY(speed);
    }

    setInitialOrResetPosition(initial = true) {
        this.cone.position.set(0, 5, 50);
        if (initial) {
            this.cone.rotateX(degreesToRadians(-90));
        }
    }

    shoot(speed, airplane, game) {
        let bullet = new Bullet(speed);
        bullet.create(airplane);
        game.addOnScene(bullet.sphere);
        return bullet;
    }
}

{/**
    Classe referente ao objeto que controla as
    funcionalidades dos projetes que o avião atira'.
*/}
export class Bullet {
    constructor(speed) {
        this.geometry = new THREE.SphereGeometry( 0.5, 32, 32 );
        this.material = new THREE.MeshBasicMaterial( { color: 0xffa500 } );
        this.sphere = new THREE.Mesh( this.geometry, this.material );
        this.speed = speed * 2.25;
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
    }


}