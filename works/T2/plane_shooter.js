import * as THREE from 'three';
import KeyboardState from '../../libs/util/KeyboardState.js';  
import {
	initRenderer, 
	initCamera,
	initDefaultBasicLight,
	initBasicMaterial,
	InfoBox,
	onWindowResize,
    degreesToRadians,
	createGroundPlaneWired
} from "../../libs/util/util.js";

import { Scenario } from './scenario.js';
import { Airplane } from './plane.js';
import { lineEnemy, archEnemy, diagonalEnemy } from './enemies.js';
import { Life } from './life.js';

const SPEED = 1;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let lives = [];
let timers = [];


const clearGeometryArray = (array) => {
    array.forEach((element, idx) => {
        game.scene.remove(element.getGeometry());
        array.splice(idx, 1)
    });
};

var Timer = function(callback, delay) {
    var timerId, start, remaining = delay;

    this.pause = function() {
        window.clearTimeout(timerId);
        timerId = null;
        remaining -= Date.now() - start;
    };

    this.resume = function() {
        if (timerId) {
            return;
        }

        start = Date.now();
        timerId = window.setTimeout(callback, remaining);
    };

    this.cancel = function() {
        window.clearTimeout(timerId);
        timerId = null;
    };

    this.resume();
};

function spawnEnemy(type){
    if(type == 'line'){
        var new_enemy = new lineEnemy(1);
        new_enemy.setPosition(Math.ceil(Math.random() * 70) * (Math.round(Math.random()) ? 1 : -1), 5,
                                game.cameraHolder.position.z - 300);
        enemies.push(new_enemy);
        game.scene.add(new_enemy.cube);
    }
    if(type == 'arch'){
        if(Math.random() >= 0.5){
            var new_enemy = new archEnemy('right');
            new_enemy.setPosition(-150, 5, game.cameraHolder.position.z - 270);
            enemies.push(new_enemy);
            game.scene.add(new_enemy.cube);
        }
        else{
            var new_enemy = new archEnemy('left');
            new_enemy.setPosition(150, 5, game.cameraHolder.position.z - 270);
            enemies.push(new_enemy);
            game.scene.add(new_enemy.cube);
        }
    }
    if(type == 'diag'){
        if(Math.random() >= 0.5){
            var new_enemy = new diagonalEnemy(1, 'right');
            new_enemy.setPosition(-70, 5, game.cameraHolder.position.z - 270);
            enemies.push(new_enemy);
            game.scene.add(new_enemy.cube);
        }
        else{
            var new_enemy = new diagonalEnemy(1, 'left');
            new_enemy.setPosition(70, 5, game.cameraHolder.position.z - 300);
            enemies.push(new_enemy);
            game.scene.add(new_enemy.cube);
        }
    }
}

function switchPermission(){
    game.spawnPermission = !game.spawnPermission;
}

class Game {
    constructor() {
        this.started = false;
        this.running = false;
        this.paused = false;
        this.isGodMode = false;
        this.scene = new THREE.Scene();    // Create main scene
        this.renderer = initRenderer();    // Init a basic renderer
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); // Init camera in this position
        this.light = initDefaultBasicLight(this.scene); // Create a basic light to illuminate the scene

        // Creating a holder for the camera
        this.cameraHolder = new THREE.Object3D();
        this.cameraHolder.add(this.camera);
        this.scene.add(this.cameraHolder);

        this.game_level = 0;
        this.SPAWN_PROBABILITY = 0.05;
        this.LIFE_SPAWN_PROBABILITY = 0.0025;
        this.levelDuration = [100000, 300, 1000, 300]
        this.spawnPermission = true;
        this.spawnWait = 800;
    }

    init(airplane, scenario) {
        this.camera.lookAt(0, 0, 0);
        this.camera.up.set( 0, 1, 0 );
        this.cameraHolder.position.set(0, 70, 91);
        this.cameraHolder.rotateX(degreesToRadians(-40));
        
        this.scene.add(scenario.ground_plane);
        this.scene.add(scenario.second_ground_plane);
        
        this.scene.add(airplane.cone);
        airplane.setInitialOrResetPosition();
    }

    reset(airplane, scenario) {
        this.cameraHolder.position.set(0, 70, 91);
        
        this.scene.add(airplane.cone);
        airplane.setInitialOrResetPosition(false);
        this.started = false;
    }

    start() {
        this.running = true;
    }

    addOnScene(object) {
        this.scene.add(object);
    }

    godMode() {
        this.isGodMode = !this.isGodMode;
    }

    //Adiciona novos inimigos em tempo de jogo com posicao e velocidade aleatórias
    update() {
        if (Math.random() < this.LIFE_SPAWN_PROBABILITY) {
            let new_life = new Life();
            new_life.setPosition(Math.ceil(Math.random() * 70) * (Math.round(Math.random()) ? 1 : -1), 5,
            this.cameraHolder.position.z - 300);
            lives.push(new_life);
            this.scene.add(new_life.life);
        }
        

        if(this.game_level == 0 && this.spawnPermission){
            spawnEnemy('line');
            spawnEnemy('arch');
            this.spawnPermission = false;
            var permissionTimer1 = new Timer(switchPermission, this.spawnWait);
            timers[0] = permissionTimer1;
        }
        if(this.game_level == 1 && this.spawnPermission){
            this.spawnWait = 650;
            spawnEnemy('line');
            spawnEnemy('line');
            this.spawnPermission = false;
            var permissionTimer2 = new Timer(switchPermission, this.spawnWait);
            timers[1] = permissionTimer2;
        }
        if(this.game_level == 2 && this.spawnPermission){
            spawnEnemy('line');
            spawnEnemy('diag');
            this.spawnPermission = false;
            var permissionTimer3 = new Timer(switchPermission, this.spawnWait);
            timers[2] = permissionTimer3;
        }
    }
}

let game = new Game();

// Listen window size changes
window.addEventListener(
    'resize',
    function(){ onWindowResize(game.camera, game.renderer) },
    false 
);

// Show axes (parameter is size of each axis)
//let axesHelper = new THREE.AxesHelper( 12 );
//game.scene.add( axesHelper );

// To use the keyboard
let keyboard = new KeyboardState();

// Create the ground plane
let main_scenario = new Scenario(600, 600);

// Create plane
let airplane = new Airplane();

// Initializing the game
game.init(airplane, main_scenario);

let controls = new InfoBox();
controls.add("Plane Shooter");
controls.addParagraph();
controls.add("Use keyboard to interact:");
controls.add("* Press P to start/pause");
controls.add("* R to reset the game");
controls.add("* Use arrows to move the airplane");
controls.show();

render();

function fullReset() {
    main_scenario.reset();
    game.reset(airplane, main_scenario);
    game.game_level = 0;
    clearGeometryArray(bullets);
    clearGeometryArray(enemies);
    clearGeometryArray(enemyBullets);
    clearGeometryArray(lives);
    airplane.cone.scale.set(1, 1, 1);
    airplane.life = 5;
    game.started = false;
    game.running = false;
    game.spawnPermission = true;

    for(var i = 0; i < timers.length; i++){
        if(timers[i] != null){
            timers[i].cancel();
        }
    }
    timers = [];
}

function advance_level() {
    game.game_level++;
}

function sumFirstElements(array, n){
    var sum = 0;
    for(var i = 0; i < n; i++){
        sum += array[i];
    }
    return sum;
}

function keyboardUpdate() {
    keyboard.update();

    if ( keyboard.down("P") ) {
        if(!game.started){
            var levelOneTimer = new Timer(advance_level, sumFirstElements(game.levelDuration, 1));
            timers[3] = levelOneTimer;
            var levelTwoTimer = new Timer(advance_level, sumFirstElements(game.levelDuration, 2));
            timers[4] = levelTwoTimer;
            var levelThreeTimer = new Timer(advance_level, sumFirstElements(game.levelDuration, 3));
            timers[5] = levelThreeTimer;
            var levelFourTimer = new Timer(advance_level, sumFirstElements(game.levelDuration, 4));
            timers[6] = levelFourTimer;
            game.started = true;
        }
        else{
            if(!game.paused){
                for(var i = 0; i < timers.length; i++){
                    if(timers[i] != null){
                        timers[i].pause();
                    }
                }
                game.paused = true;
            }
            else{
                for(var i = 0; i < timers.length; i++){
                    if(timers[i] != null){
                        timers[i].resume();
                    }
                }
                game.paused = false;
            }
        }
        game.running = !game.running;
    }
    if ( keyboard.pressed("R") ) {
        fullReset();
    }

    // Airplane controls
    if ( keyboard.pressed("left") && game.running) {
        if ((airplane.cone.position.x - game.cameraHolder.position.x) > -70 )
            airplane.cone.translateX(-1);
    }
    if ( keyboard.pressed("right") && game.running ) {
        if ((airplane.cone.position.x - game.cameraHolder.position.x) < 70 )
            airplane.cone.translateX(1);
    }
    if ( keyboard.pressed("up") && game.running ) {
        if ((airplane.cone.position.z - game.cameraHolder.position.z) > -200 )
            airplane.cone.translateY(1);
    }
    if ( keyboard.pressed("down") && game.running ) {
        if ((airplane.cone.position.z - game.cameraHolder.position.z) < -40 )
            airplane.cone.translateY(-1);
    }
    if (keyboard.down("G")) {
        game.godMode();
    }
    if (keyboard.pressed("space") && game.running) {
        //novo tiro do aviao para baixo
    }
    if (keyboard.pressed("ctrl") && game.running ) {
        let bullet = airplane.shoot(SPEED, airplane, game);
        if(bullet != null) {
            bullets.push(bullet);
        }
    }
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

//Checa se os objetos saíram da tela ou colidiram
async function checkBoundariesAndCollisions() {

    //for INIMIGOS
    for(var i = 0; i < enemies.length; i++) {
        enemies[i].update();
        let enemy_bullet = enemies[i].shoot(1.4, airplane);
        if (enemy_bullet) {
            game.addOnScene(enemy_bullet.sphere);
            enemyBullets.push(enemy_bullet);
        }
        
        //Removendo inimigos que saíram da tela
        if(enemies[i].cube.position.z > game.cameraHolder.position.z - 40 || enemies[i].cube.position.x > 151 || 
            enemies[i].cube.position.x < -200) {
            game.scene.remove(enemies[i].cube);
            enemies.splice(i, 1);
            i--;
            if(i >= enemies.length || i < 0) {
                break;
            }
        }
        
        //Removendo inimigos e mísseis que colidiram
        var shot = enemies[i].checkMissileCollision(bullets);
        if(shot > -1){
            game.scene.remove(bullets[shot].sphere);
            bullets.splice(shot, 1);
            
            let temp_cube = enemies[i].cube
            enemies.splice(i, 1);

            //Animação de colisão
            gsap.to(temp_cube.rotation, {y: 3.15, duration: 0.25});
            gsap.to(temp_cube.position, {z: temp_cube.position.z - 20, duration: 0.25});
            await sleep(500);
            game.scene.remove(temp_cube);
            i--;
        }
        
        //Verificar se ainda há inimigos em jogo antes de verificar colisão com avião
        if(i >= enemies.length || i < 0) {
            break;
        }

        //Removendo inimigos e avião que colidiram
        if (!game.isGodMode) {
            var crash = enemies[i].checkPlaneCollision(airplane)
            if(crash) {
                let endTime = new Date();
                if(endTime - airplane.damageTime >= 100) {
                    airplane.damageTime = new Date();
                    // Aviao toma dano
                    if (airplane.life > 2) {
                        //Animacao de dano
                        gsap.to(airplane.cone.scale, {x:0.4, y: 0.4, z: 0.4, duration: 0.1});
                        await sleep(100)
                        gsap.to(airplane.cone.scale, {x:1, y: 1, z: 1, duration: 0.1});
                        airplane.decreaseLife(2);
                    }
                    else { // Aviao morre
                        //Animação de colisão
                        gsap.to(airplane.cone.scale, {x:0, y: 0, z: 0, duration: 0.25});
                        await sleep(500);
                        fullReset();
                    }
                }
            }
        }
    }

    //for VIDAS
    for(var i = 0; i < lives.length; i++) {
        lives[i].update();
        
        //Removendo vidas que sairam da tela
        if(lives[i].life.position.z > game.cameraHolder.position.z || lives[i].life.position.x > 70 || 
            lives[i].life.position.x < -70) {
            game.scene.remove(lives[i].life);
            lives.splice(i, 1);
            i--;
            if(i >= lives.length || i < 0) {
                break;
            }
        }
        
        //Verificar se ainda existem vidas em jogo antes de verificar colisao com aviao
        if(i >= lives.length || i < 0) {
            break;
        }

        //Removendo vidas e aviao que colidiram
        var crash = lives[i].checkPlaneCollision(airplane)
        if(crash) {
            let temp_life = lives[i].life;
            lives.splice(i, 1);
            //Animacao de colisao
            gsap.to(temp_life.scale, {x:0, y: 0, z: 0, duration: 0.25});
            airplane.increaseLife();
            await sleep(250);
            game.scene.remove(temp_life);
            i--;
            console.log("VIDAS ATUAIS: ", airplane.life);
        }
    }

    //for MISSEIS INIMIGOS
    if (!game.isGodMode) {
        for (let j = 0; j < enemyBullets.length; j++) {
            //Removendo misseis e avião que colidiram
            let shot = airplane.checkMissileCollision(enemyBullets);
            
            if(shot > -1) {
                let endTime = new Date();
                if(endTime - airplane.damageTime >= 100) {
                    game.scene.remove(enemyBullets[j].sphere);
                    enemyBullets.splice(j, 1);
                    airplane.damageTime = new Date();
                    // Aviao toma dano
                    if (airplane.life > 1) {
                        //Animacao de dano
                        gsap.to(airplane.cone.scale, {x:0.4, y: 0.4, z: 0.4, duration: 0.1});
                        await sleep(100)
                        gsap.to(airplane.cone.scale, {x:1, y: 1, z: 1, duration: 0.1});
                        airplane.decreaseLife(1);
                    }
                    else { // Aviao morre
                        //Animação de colisão
                        gsap.to(airplane.cone.scale, {x:0, y: 0, z: 0, duration: 0.25});
                        await sleep(500);
                        fullReset();
                    }
                    j--;
                }
            }
        }
    }

    //Removendo misseis inimigos que sairam da tela
    for(var i = 0; i < enemyBullets.length; i++) {
        if(enemyBullets[i].sphere.position.z > game.cameraHolder.position.z) {
            game.scene.remove(enemyBullets[i].sphere);
            enemyBullets.splice(i, 1);
        }
    }

    //Removendo mísseis que saíram da tela
    for(var i = 0; i < bullets.length; i++) {
        if(bullets[i].sphere.position.z < game.cameraHolder.position.z - 200) {
            game.scene.remove(bullets[i].sphere);
            bullets.splice(i, 1);
        }
    }

}

function render()
{
    keyboardUpdate();
    if (game.running) {
        //Movimento dos mísseis
        bullets.forEach(bullet => {
            bullet.update();
        });

        enemyBullets.forEach(enemyBullet => {
            enemyBullet.update();
        });
        
        //Movimento do avião
        airplane.update(SPEED);

        main_scenario.update(game.cameraHolder);
        game.update();
        game.cameraHolder.position.z -= SPEED;

        //Movimento dos inimigos
        checkBoundariesAndCollisions();
    }
    requestAnimationFrame(render);
    game.renderer.render(game.scene, game.camera) // Render scene
}
