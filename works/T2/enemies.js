import * as THREE from  'three';
import { EnemyBullet, GroundAirEnemyMissile } from './bullets.js'
// import { degreesToRadians } from '../../libs/util/util';

function degreesToRadians(degrees)
{
    var pi = Math.PI;
    return degrees * (pi/180);
}

{/**
    Classe referente ao objeto que controla as
    funcionalidades de um inimigo'.
*/}
export class lineEnemy {
    constructor(speed, model) {
        this.geometry = new THREE.BoxGeometry( 5, 5, 5 );
        this.material = new THREE.MeshLambertMaterial({ color: 0xFF0000, transparent: true, opacity: 1 });
        this.object = new THREE.Mesh( this.geometry, this.material );

        this.speed = speed;
        this.boundingBox = new THREE.Box3().setFromObject(this.object);
        this.shootPermission = false;
        this.startTime = new Date();
        return;
    }

    //Define posicao do cubo
    setPosition(x, y, z) {
        this.object.position.set(x, y, z)
        return;
    }

    //Movimenta com base em sua velocidade
    update() {
        let endTime = new Date();
        if(endTime - this.startTime > 1000) {
            this.shootPermission = true;
            this.startTime = new Date();
        }
        this.object.translateZ(this.speed);
        this.boundingBox.copy(this.object.geometry.boundingBox).applyMatrix4(this.object.matrixWorld);
    }

    shoot(speed, airplane) {
        if(this.shootPermission && this.object.position.z <= airplane.getPosition().z){
            let bullet = new EnemyBullet(speed);
            bullet.create(this);
            bullet.sphere.lookAt(airplane.getGeometry().position);
            this.shootPermission = false;
            return bullet;
        }
        else {
            return null;
        }
    }

    //Checa colisão do objeto com todos os mísseis na tela
    checkMissileCollision(missiles) {
        for(var i = 0; i < missiles.length; i++) {
            if(this.boundingBox.intersectsBox(missiles[i].boundingBox)) {
                return i;
            }
        }
        return -1;
    }

    //Checa colisão do objeto com o avião
    checkPlaneCollision(plane) {
        if(this.boundingBox.intersectsBox(plane.boundingBox)) {
            return true;
        }
        else {
            return false;
        }
    }

    getGeometry() {
        return this.object;
    }
}

export class archEnemy {
    constructor(direction='left') {
        this.geometry = new THREE.BoxGeometry( 5, 5, 5 );
        this.material = new THREE.MeshLambertMaterial({color: 0xFF0000});
        this.object = new THREE.Mesh( this.geometry, this.material );
        this.object.castShadow = true;
        this.object.receiveShadow = true;

        this.object.rotateY(degreesToRadians(45 * (this.direction === 'left' ? -1 : 1)));

        this.direction = direction;
        this.boundingBox = new THREE.Box3().setFromObject(this.object);
        this.shootPermission = false;
        this.startTime = new Date();
        this.t = 0;
        // this.object.geometry.computeBoundingBox();
        return;
    }

    //Define posicao do cubo
    setPosition(x, y, z) {
        this.object.position.set(x, y, z)
        return;
    }

    // WORK IN PROGRESS
    //Movimenta com base em sua velocidade
    update() {
        let endTime = new Date();
        if(endTime - this.startTime > 1000) {
            this.shootPermission = true;
            this.startTime = new Date();
        }
        
        this.object.rotateY(degreesToRadians(1 * (this.direction === 'left' ? -1 : 1)));
        this.object.translateZ((this.object.rotation.y + 3.5)*0.85);

        this.boundingBox.copy(this.object.geometry.boundingBox).applyMatrix4(this.object.matrixWorld);
    }

    shoot(speed, airplane) {
        if(this.shootPermission && this.object.position.z <= airplane.getPosition().z){
            let bullet = new EnemyBullet(speed);
            bullet.create(this);
            bullet.sphere.lookAt(airplane.getGeometry().position);
            this.shootPermission = false;
            return bullet;
        }
        else {
            return null;
        }
    }

    //Checa colisão do objeto com todos os mísseis na tela
    checkMissileCollision(missiles) {
        for(var i = 0; i < missiles.length; i++) {
            if(this.boundingBox.intersectsBox(missiles[i].boundingBox)) {
                return i;
            }
        }
        return -1;
    }

    //Checa colisão do objeto com o avião
    checkPlaneCollision(plane) {
        if(this.boundingBox.intersectsBox(plane.boundingBox)) {
            return true;
        }
        else {
            return false;
        }
    }

    getGeometry() {
        return this.object;
    }
}

export class diagonalEnemy {
    constructor(speed) {
        this.geometry = new THREE.BoxGeometry( 5, 5, 5 );
        this.material = new THREE.MeshLambertMaterial({color: 0xFF0000});
        this.object = new THREE.Mesh( this.geometry, this.material );
        this.object.castShadow = true;
        this.object.receiveShadow = true;

        this.speed = speed;
        this.boundingBox = new THREE.Box3().setFromObject(this.object);
        this.shootPermission = false;
        this.startTime = new Date();
        // this.object.geometry.computeBoundingBox();
        return;
    }

    //Define posicao do cubo
    setPosition(x, y, z) {
        this.object.position.set(x, y, z)
        return;
    }

    //Movimenta com base em sua velocidade
    update() {
        let endTime = new Date();
        if(endTime - this.startTime > 950) {
            this.shootPermission = true;
            this.startTime = new Date();
        }
        this.object.translateZ(this.speed);
        this.object.translateX(this.speed);
        this.boundingBox.copy(this.object.geometry.boundingBox).applyMatrix4(this.object.matrixWorld);
    }

    shoot(speed, airplane) {
        if(this.shootPermission && this.object.position.z <= airplane.getPosition().z){
            let bullet = new EnemyBullet(speed);
            bullet.create(this);
            bullet.sphere.lookAt(airplane.getGeometry().position);
            this.shootPermission = false;
            return bullet;
        }
        else {
            return null;
        }
    }

    //Checa colisão do objeto com todos os mísseis na tela
    checkMissileCollision(missiles) {
        for(var i = 0; i < missiles.length; i++) {
            if(this.boundingBox.intersectsBox(missiles[i].boundingBox)) {
                return i;
            }
        }
        return -1;
    }

    //Checa colisão do objeto com o avião
    checkPlaneCollision(plane) {
        if(this.boundingBox.intersectsBox(plane.boundingBox)) {
            return true;
        }
        else {
            return false;
        }
    }

    getGeometry() {
        return this.object;
    }
}


export class GroundEnemy {
    constructor(speed) {
        this.geometry = new THREE.BoxGeometry( 10, 5, 10 );
        this.material = new THREE.MeshLambertMaterial({ color: 0x8c6d1f });
        this.object = new THREE.Mesh( this.geometry, this.material );
        this.object.castShadow = true;
        this.object.receiveShadow = true;

        this.speed = speed;
        this.boundingBox = new THREE.Box3().setFromObject(this.object);
        this.shootPermission = false;
        this.startTime = new Date();
        return;
    }

    //Define posicao do cubo
    setPosition(x, y, z) {
        this.object.position.set(x, y, z)
        return;
    }

    //Movimenta com base em sua velocidade
    update() {
        let endTime = new Date();
        if(endTime - this.startTime > 2000) {
            this.shootPermission = true;
            this.startTime = new Date();
        }
        this.object.translateZ(this.speed);
        this.boundingBox.copy(this.object.geometry.boundingBox).applyMatrix4(this.object.matrixWorld);
    }

    shoot(speed, airplane) {
        if(this.shootPermission && this.object.position.z <= airplane.getPosition().z){
            let bullet = new GroundAirEnemyMissile(speed);
            bullet.create(this);
            this.shootPermission = false;
            return bullet;
        }
        else {
            return null;
        }
    }

    //Checa colisão do objeto com todos os mísseis na tela
    checkMissileCollision(missiles) {
        for(var i = 0; i < missiles.length; i++) {
            if(this.boundingBox.intersectsBox(missiles[i].boundingBox)) {
                return i;
            }
        }
        return -1;
    }

    //Checa colisão do objeto com o avião
    checkPlaneCollision(plane) {
        if(this.boundingBox.intersectsBox(plane.boundingBox)) {
            return true;
        }
        else {
            return false;
        }
    }

    getGeometry() {
        return this.object;
    }
}