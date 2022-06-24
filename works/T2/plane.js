import * as THREE from  'three';
import { degreesToRadians } from '../../libs/util/util.js';
import { Bomb, Bullet } from './bullets.js';
import { getPlaneObject } from './helper.js';

{/**
    Classe referente ao objeto que controla as
    funcionalidades do avião.
*/}

export class Airplane {
    constructor() {
        this.planeObject = getPlaneObject();
        this.geometry = new THREE.ConeGeometry( 2, 3, 32 );
        this.material = new THREE.MeshLambertMaterial({color: 'transparent'});
        this.cone = new THREE.Mesh( this.geometry, this.material );
        this.boundingBox = new THREE.Box3().setFromObject(this.cone);
        this.cone.add(this.planeObject);
        this.shootPermission = false;
        this.startTime = new Date();
        this.life = 5;
        this.damageTime = new Date();
        this.bombPermission = false;
        this.bombStartTime = new Date();
    }

    update(speed) {
        let endTime = new Date();
        let bombEndTime = new Date();
        if(endTime - this.startTime >= 500) {
            this.shootPermission = true;
            this.startTime = new Date();
        }
        if(bombEndTime - this.bombStartTime >= 500) {
            this.bombPermission = true;
            this.bombStartTime = new Date();
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

    decreaseLife(hitPoints) {
        this.life = this.life - hitPoints;
    }

    increaseLife() {
        if (this.life < 5) {
            this.life = this.life + 1;
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

    bomb(speed, airplane, game) {
        if(this.bombPermission){
            let bomb = new Bomb(speed);
            bomb.create(airplane);
            game.addOnScene(bomb.sphere);
            this.bombPermission = false;
            return bomb;
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

    getGeometry() {
        return this.cone;
    }
}
