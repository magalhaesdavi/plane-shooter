import * as THREE from  'three';
import { degreesToRadians } from '../../libs/util/util.js';
import { Bullet } from './bullets.js';

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
        if(endTime - this.startTime > 150) {
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

    shoot(speed, airplane, game) {
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

    checkMissileCollision(missiles) {
        for(var i = 0; i < missiles.length; i++) {
            if(this.boundingBox.intersectsBox(missiles[i].boundingBox)) {
                return i;
            }
        }
        return -1;
    }
}
