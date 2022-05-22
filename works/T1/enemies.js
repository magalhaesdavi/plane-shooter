import * as THREE from  'three';

{/**
    Classe referente ao objeto que controla as
    funcionalidades de um inimigo'.
*/}
export class Enemy {
    constructor(speed) {
        this.geometry = new THREE.BoxGeometry( 4, 4, 4 );
        this.material = new THREE.MeshLambertMaterial({color: 0xFF0000});
        this.cube = new THREE.Mesh( this.geometry, this.material );
        this.speed = speed;
        this.boundingBox = new THREE.Box3().setFromObject(this.cube);
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
        this.cube.translateZ(this.speed);
        this.boundingBox.copy(this.cube.geometry.boundingBox).applyMatrix4(this.cube.matrixWorld);
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
}
