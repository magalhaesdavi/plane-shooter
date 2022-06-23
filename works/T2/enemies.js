import * as THREE from  'three';
import { EnemyBullet } from './bullets.js'
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
    constructor(speed) {
        this.geometry = new THREE.BoxGeometry( 4, 4, 4 );
        this.material = new THREE.MeshLambertMaterial({color: 0xFF0000});
        this.cube = new THREE.Mesh( this.geometry, this.material );
        this.speed = speed;
        this.boundingBox = new THREE.Box3().setFromObject(this.cube);
        this.shootPermission = false;
        this.startTime = new Date();
        return;
    }

    //Define posicao do cubo
    setPosition(x, y, z) {
        this.cube.position.set(x, y, z)
        return;
    }

    //Movimenta com base em sua velocidade
    update() {
        let endTime = new Date();
        if(endTime - this.startTime > 1000) {
            this.shootPermission = true;
            this.startTime = new Date();
        }
        this.cube.translateZ(this.speed);
        this.boundingBox.copy(this.cube.geometry.boundingBox).applyMatrix4(this.cube.matrixWorld);
    }

    shoot(speed, airplane) {
        if(this.shootPermission){
            let bullet = new EnemyBullet(speed);
            bullet.create(this);
            bullet.sphere.lookAt(airplane.cone.position);
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
        return this.cube;
    }
}

export class archEnemy {
    constructor(speed) {
        this.geometry = new THREE.BoxGeometry( 4, 4, 4 );
        this.material = new THREE.MeshLambertMaterial({color: 0xFF0000});
        this.cube = new THREE.Mesh( this.geometry, this.material );
        this.speed = speed;
        this.boundingBox = new THREE.Box3().setFromObject(this.cube);
        this.shootPermission = false;
        this.startTime = new Date();
        this.t = 0;
        // this.cube.geometry.computeBoundingBox();
        return;
    }

    //Define posicao do cubo
    setPosition(x, y, z) {
        this.cube.position.set(x, y, z)
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
        this.cube.translateZ(this.speed);
        // this.cube.translateX(this.speed);
        this.cube.rotateY(degreesToRadians(1));

        // this.cube.translateZ(Math.sin((Date.now()%60000)/60000 * Math.PI * 20) * 50);
        // this.cube.translateX(Math.cos((Date.now()%60000)/60000 * Math.PI * 20) * 50);

        // this.cube.position.x += Math.sin(this.speed * Math.PI * 2) * 50;
        // this.cube.position.z += Math.sin(this.speed * Math.PI * 2) * 50;
        // this.speed += 0.01

        // this.cube.rotateY(degreesToRadians(1));

        // this.t += 0.1; 
        // this.cube.rotation.y += 0.005;
        // this.cube.position.x = 20*Math.cos(this.t) + 0;
        // this.cube.position.z = 20*Math.sin(this.t) + 0;

        this.boundingBox.copy(this.cube.geometry.boundingBox).applyMatrix4(this.cube.matrixWorld);
    }

    shoot(speed, airplane) {
        if(this.shootPermission){
            let bullet = new EnemyBullet(speed);
            bullet.create(this);
            bullet.sphere.lookAt(airplane.cone.position);
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
        return this.cube;
    }
}

export class diagonalEnemy {
    constructor(speed) {
        this.geometry = new THREE.BoxGeometry( 4, 4, 4 );
        this.material = new THREE.MeshLambertMaterial({color: 0xFF0000});
        this.cube = new THREE.Mesh( this.geometry, this.material );
        this.speed = speed;
        this.boundingBox = new THREE.Box3().setFromObject(this.cube);
        this.shootPermission = false;
        this.startTime = new Date();
        // this.cube.geometry.computeBoundingBox();
        return;
    }

    //Define posicao do cubo
    setPosition(x, y, z) {
        this.cube.position.set(x, y, z)
        return;
    }

    //Movimenta com base em sua velocidade
    update() {
        let endTime = new Date();
        if(endTime - this.startTime > 1000) {
            this.shootPermission = true;
            this.startTime = new Date();
        }
        this.cube.translateZ(this.speed);
        this.cube.translateX(this.speed);
        this.boundingBox.copy(this.cube.geometry.boundingBox).applyMatrix4(this.cube.matrixWorld);
    }

    shoot(speed, airplane) {
        if(this.shootPermission){
            let bullet = new EnemyBullet(speed);
            bullet.create(this);
            bullet.sphere.lookAt(airplane.cone.position);
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
        return this.cube;
    }
}