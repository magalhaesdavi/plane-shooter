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
import { SecondaryBox } from './helper.js';
import { GLTFLoader } from '../../build/jsm/loaders/GLTFLoader.js';

import { Scenario } from './scenario.js';
import { Airplane } from './plane.js';
import { lineEnemy, archEnemy, diagonalEnemy, GroundEnemy } from './enemies.js';
import { Life } from './life.js';
import { GroundAirEnemyMissile } from './bullets.js';

const CAMERA_HEIGHT = 110;
const LIGHT_HEIGHT = 130;
const LIGHT_Z_DISTANCE = 70;
const LIGHT_RANGE = 600;
const AIR_ENEMIES_HEIGHT = 20;
const SPEED = 1;

let bullets = [];
let enemyBullets = [];
let enemies = [];
let lives = [];
let timers = [];

const infoBox = new SecondaryBox("God Mode OFF");

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

async function spawnEnemy(type){
    if(type == 'line'){
        let lineEnemyModel = await game.loadModel('./assets/fighter6.glb');
        var new_enemy = new lineEnemy(1, lineEnemyModel);
        new_enemy.setPosition(Math.ceil(Math.random() * 70) * (Math.round(Math.random()) ? 1 : -1), AIR_ENEMIES_HEIGHT,
                                game.cameraHolder.position.z - 300);
        enemies.push(new_enemy);
        game.scene.add(new_enemy.getGeometry());
    }
    if(type == 'arch'){
        let archEnemyModel = await game.loadModel('./assets/fighter1.glb');
        if(Math.random() >= 0.5){
            let new_enemy = new archEnemy('right', archEnemyModel);
            new_enemy.setPosition(-170, AIR_ENEMIES_HEIGHT, game.cameraHolder.position.z - 210);
            enemies.push(new_enemy);
            game.scene.add(new_enemy.getGeometry());
        }
        else{
            let new_enemy = new archEnemy('left', archEnemyModel);
            new_enemy.setPosition(170, AIR_ENEMIES_HEIGHT, game.cameraHolder.position.z - 210);
            enemies.push(new_enemy);
            game.scene.add(new_enemy.getGeometry());
        }
    }
    if(type == 'diag'){
        let diagonalEnemyModel = await game.loadModel('./assets/fighter5.glb');
        if(Math.random() >= 0.5){
            var new_enemy = new diagonalEnemy('left', 1, diagonalEnemyModel);
            new_enemy.setPosition(-140, AIR_ENEMIES_HEIGHT, game.cameraHolder.position.z - 250);
            enemies.push(new_enemy);
            game.scene.add(new_enemy.getGeometry());
        }
        else{
            var new_enemy = new diagonalEnemy('right', 1, diagonalEnemyModel);
            new_enemy.setPosition(140, AIR_ENEMIES_HEIGHT, game.cameraHolder.position.z - 250);
            enemies.push(new_enemy);
            game.scene.add(new_enemy.getGeometry());
        }
    }
    if (type == 'ground') {
        let groundEnemyModel = await game.loadModel('./assets/fighter3.glb');
        let new_enemy = new GroundEnemy(0, groundEnemyModel);
        new_enemy.setPosition(
            Math.ceil(Math.random() * 80) * (Math.round(Math.random()) ? 1 : -1),
            2.5,
            game.cameraHolder.position.z - 400
        );
        enemies.push(new_enemy);
        game.scene.add(new_enemy.getGeometry());
    }
}

function spawnLife(){
    let new_life = new Life();
    new_life.setPosition(
        Math.ceil(Math.random() * 70) * (Math.round(Math.random()) ? 1 : -1),
        AIR_ENEMIES_HEIGHT,
        game.cameraHolder.position.z - 300
    );
    lives.push(new_life);
    game.scene.add(new_life.life);
}

function switchEnemySpawnPermission(){
    game.enemySpawnPermission = !game.enemySpawnPermission;
}

function switchLifeSpawnPermission(){
    game.lifeSpawnPermission = !game.lifeSpawnPermission;
}

class Game {
    constructor() {
        this.started = false;
        this.running = false;
        this.paused = false;
        this.isGodMode = false;
        this.scene = new THREE.Scene();    // Create main scene
        this.renderer = initRenderer();    // Init a basic renderer
        this.renderer.shadowMap.enabled = true;
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); // Init camera in this position

        this.light = new THREE.PointLight(0xedca61, 2.5, LIGHT_RANGE);
        this.light.castShadow = true;

        this.loader = new GLTFLoader();

        this.scene.add(this.light);

        // Creating a holder for the camera
        this.cameraHolder = new THREE.Object3D();
        this.cameraHolder.add(this.camera);
        this.scene.add(this.cameraHolder);

        this.gameLevel = 0;
        this.ENEMY_SPAWN_PROBABILITY = 0.05;
        this.LIFE_SPAWN_PROBABILITY = 0.0025;
        this.levelDuration = [20000, 5000, 20000, 5000, 20000]
        this.enemySpawnPermission = true;
        this.lifeSpawnPermission = true;
        this.enemySpawnWait = 800;
        this.lifeSpawnWait = 8000;
    }

    init(airplane, scenario) {
        this.camera.lookAt(0, 0, 0);
        this.camera.up.set( 0, 1, 0 );
        this.cameraHolder.position.set(0, CAMERA_HEIGHT, 100);
        this.cameraHolder.rotateX(degreesToRadians(-40));

        this.light.lookAt(0, 0, 0);
        this.light.up.set( 0, 1, 0 );
        this.light.position.set(0, LIGHT_HEIGHT, LIGHT_Z_DISTANCE);
        this.light.rotateX(degreesToRadians(-45));
        
        this.scene.add(scenario.ground_plane);
        this.scene.add(scenario.second_ground_plane);
        
        this.scene.add(airplane.getGeometry());
        airplane.setInitialOrResetPosition();
    }

    reset(airplane, scenario) {
        this.cameraHolder.position.set(0, CAMERA_HEIGHT, 100);
        this.light.position.set(0, LIGHT_HEIGHT, LIGHT_Z_DISTANCE);
        
        this.scene.add(airplane.getGeometry());
        airplane.setInitialOrResetPosition(false);
        this.started = false;
    }

    start() {
        this.running = true;
    }

    addOnScene(object) {
        this.scene.add(object);
    }

    async loadModel(path='./assets/plane.obj', objectName="obj1") {
        let model = await this.loader.loadAsync(
            path, 
            null
        );

        model.scene.traverse( 
            function ( child ) {
                if ( child ) {
                    child.castShadow = true;
                }
            }
        );

        model.scene.traverse(
            function( node ) {
                if( node.material ) node.material.side = THREE.DoubleSide;
            }
        );

        return model.scene;
    }

    godMode() {
        this.isGodMode = !this.isGodMode;
    }

    //Adiciona novos inimigos em tempo de jogo com posicao e velocidade aleatórias
    update() {
        if(this.gameLevel == 0 && this.enemySpawnPermission){
            spawnEnemy('line');
            spawnEnemy('line');
            this.enemySpawnPermission = false;
            var permissionTimer1 = new Timer(switchEnemySpawnPermission, this.enemySpawnWait);
            timers[0] = permissionTimer1;
        }
        
        if(this.gameLevel == 1 && this.enemySpawnPermission){
            this.enemySpawnWait = 650;
            spawnEnemy('line');
            spawnEnemy('ground');
            this.enemySpawnPermission = false;
            var permissionTimer2 = new Timer(switchEnemySpawnPermission, this.enemySpawnWait);
            timers[0] = permissionTimer2;
        }
        if(this.gameLevel == 2 && this.enemySpawnPermission){
            this.enemySpawnWait = 1000;
            spawnEnemy('line');
            spawnEnemy('arch');
            this.enemySpawnPermission = false;
            var permissionTimer3 = new Timer(switchEnemySpawnPermission, this.enemySpawnWait);
            timers[0] = permissionTimer3;
        }
        if(this.gameLevel == 3 && this.enemySpawnPermission){
            this.enemySpawnWait = 800;
            spawnEnemy('line');
            spawnEnemy('arch');
            this.enemySpawnPermission = false;
            var permissionTimer3 = new Timer(switchEnemySpawnPermission, this.enemySpawnWait);
            timers[0] = permissionTimer3;
        }
        if(this.gameLevel == 4 && this.enemySpawnPermission){
            this.enemySpawnWait = 1000;
            spawnEnemy('line');
            spawnEnemy('diag');
            spawnEnemy('arch');
            spawnEnemy('ground');
            this.enemySpawnPermission = false;
            var permissionTimer3 = new Timer(switchEnemySpawnPermission, this.enemySpawnWait);
            timers[0] = permissionTimer3;
        }
        if(this.gameLevel >= 1 && this.lifeSpawnPermission){
            spawnLife();
            this.lifeSpawnPermission = false;
            var permissionTimer4 = new Timer(switchLifeSpawnPermission, this.lifeSpawnWait);
            timers[1] = permissionTimer4;
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

// To use the keyboard
let keyboard = new KeyboardState();

// Create the ground plane
let main_scenario = new Scenario(600, 600);

// Create plane
let airplaneModel = await game.loadModel('./assets/plane.glb');
let airplane = new Airplane(airplaneModel);

// Initializing the game
game.init(airplane, main_scenario);

let controls = new InfoBox();
controls.add("Plane Shooter");
controls.addParagraph();
controls.add("Use keyboard to interact:");
controls.add("* Press P to start/pause");
controls.add("* Press CTRL/SPACE to shoot");
controls.add("* G to turn on/off God Mode");
controls.add("* R to reset the game");
controls.add("* Use arrows to move the airplane");
controls.show();
controls.infoBox.style.display = "none";

render();

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const h1 = document.getElementById('h1');
const p1 = document.getElementById('p1');
const p2 = document.getElementById('p2');
const p3 = document.getElementById('p3');
const p4 = document.getElementById('p4');
const p5 = document.getElementById('p5');
const button  = document.getElementById("btn");
const button2  = document.getElementById("btn2");

const defaultInterface = () => {
    blocker.style.display = 'block';
    instructions.style.display = '';
    h1.innerHTML = "Instructions";
    p1.innerHTML = "Move: ARROWS";
    p2.innerHTML = "Shoot: CTRL/SPACE";
    p3.innerHTML = "God Mode: G";
    p4.innerHTML = "Pause/Start: P";
    p5.innerHTML = "Reset Game: R";
    button.style.display = "";
    button2.style.display = 'none';
    controls.infoBox.style.display = "none";
}

const victory = () => {
    blocker.style.display = 'block';
    instructions.style.display = '';
    h1.innerHTML = "CONGRATULATIONS!!!";
    p1.innerHTML = "You did it!";
    p2.innerHTML = "Survived and reached";
    p3.innerHTML = "the final of the game!";
    p4.innerHTML = "";
    p5.innerHTML = "";
    button.style.display = "none";
    button2.style.display = '';
}

const defeat = () => {
    blocker.style.display = 'block';
    instructions.style.display = '';
    h1.innerHTML = "DEFEAT!";
    p1.innerHTML = "You were destroyed!";
    p2.innerHTML = ":(";
    p3.innerHTML = "But you can try again!";
    p4.innerHTML = "";
    p5.innerHTML = "";
    button.style.display = "none";
    button2.style.display = "";
}

function fullReset() {
    main_scenario.reset();
    game.reset(airplane, main_scenario);
    game.gameLevel = 0;
    clearGeometryArray(bullets);
    clearGeometryArray(enemies);
    clearGeometryArray(enemyBullets);
    clearGeometryArray(lives);
    airplane.getGeometry().scale.set(1, 1, 1);
    airplane.life = 5;
    game.started = false;
    game.running = false;
    game.isGodMode = false;
    game.enemySpawnPermission = true;

    for(var i = 0; i < timers.length; i++){
        if(timers[i] != null){
            timers[i].cancel();
        }
    }
    timers = [];
}

const onStartButtonPressed = () => {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
    if(!game.started){
        var levelOneTimer = new Timer(advance_level, sumFirstElements(game.levelDuration, 1));
        timers[2] = levelOneTimer;
        var levelTwoTimer = new Timer(advance_level, sumFirstElements(game.levelDuration, 2));
        timers[3] = levelTwoTimer;
        var levelThreeTimer = new Timer(advance_level, sumFirstElements(game.levelDuration, 3));
        timers[4] = levelThreeTimer;
        var levelFourTimer = new Timer(advance_level, sumFirstElements(game.levelDuration, 4));
        timers[5] = levelFourTimer;
        game.started = true;
    }
    game.running = !game.running;
    controls.infoBox.style.display = "";
};

button.addEventListener("click", onStartButtonPressed);
button2.addEventListener("click", defaultInterface); 

function advance_level() {
    game.gameLevel++;
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
        if(game.started){
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
            game.running = !game.running;
        }
    }
    if ( keyboard.pressed("R") ) {
        fullReset();
        blocker.style.display = 'block';
        instructions.style.display = '';
        controls.infoBox.style.display = "none";
    }

    // Airplane controls
    if ( keyboard.pressed("left") && game.running) {
        if ((airplane.getGeometry().position.x - game.cameraHolder.position.x) > -70 )
            airplane.getGeometry().translateX(-1);
    }
    if ( keyboard.pressed("right") && game.running ) {
        if ((airplane.getGeometry().position.x - game.cameraHolder.position.x) < 70 )
            airplane.getGeometry().translateX(1);
    }
    if ( keyboard.pressed("up") && game.running ) {
        if ((airplane.getGeometry().position.z - game.cameraHolder.position.z) > -200 )
            airplane.getGeometry().translateY(1);
    }
    if ( keyboard.pressed("down") && game.running ) {
        if ((airplane.getGeometry().position.z - game.cameraHolder.position.z) < -50 )
            airplane.getGeometry().translateY(-1);
    }
    if (keyboard.down("G")) {
        game.godMode();
    }
    if (keyboard.pressed("space") && game.running) {
        //novo tiro do aviao para baixo
        let bomb = airplane.bomb(SPEED, airplane, game);
        if (bomb != null) {
            bullets.push(bomb);
        }
    }
    if (keyboard.pressed("ctrl") && game.running ) {
        let bullet = airplane.shoot(SPEED, airplane, game);
        if(bullet != null) {
            bullets.push(bullet);
        }
    }
}

//Checa se os objetos saíram da tela ou colidiram
async function checkBoundariesAndCollisions() {

    //for INIMIGOS
    for (var i = 0; i < enemies.length; i++) {

        enemies[i].update();

        let enemy_bullet = enemies[i].shoot(1.4, airplane);
        if (enemy_bullet) {
            game.addOnScene(enemy_bullet.sphere);
            enemyBullets.push(enemy_bullet);
        }
        
        //Removendo inimigos que saíram da tela
        if(enemies[i].getGeometry().position.z > game.cameraHolder.position.z - 40 || enemies[i].getGeometry().position.x > 151 || 
            enemies[i].getGeometry().position.x < -200) {
            game.scene.remove(enemies[i].getGeometry());
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
            
            let temp_cube = enemies[i].getGeometry();
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
                    let temp_cube = enemies[i].getGeometry();
                    enemies.splice(i, 1);
                    airplane.damageTime = new Date();
                    // Aviao toma dano
                    if (airplane.life > 2) {
                        //Animacao de dano
                        gsap.to(airplane.getGeometry().scale, {x:0.3, y: 0.3, z: 0.3, duration: 0.05});
                        gsap.to(temp_cube.scale, {x:0, y: 0, z: 0, duration: 0.05});
                        await sleep(100);
                        game.scene.remove(temp_cube);
                        i--;
                        gsap.to(airplane.getGeometry().scale, {x:1, y: 1, z: 1, duration: 0.1});
                        airplane.decreaseLife(2);
                    }
                    else { // Aviao morre
                        //Animação de colisão
                        gsap.to(airplane.getGeometry().scale, {x:0, y: 0, z: 0, duration: 0.25});
                        gsap.to(temp_cube.scale, {x:0, y: 0, z: 0, duration: 0.25});
                        await sleep(550);
                        game.scene.remove(temp_cube);
                        i--;
                        fullReset();
                        defeat();
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
                const isGroundMissile = (enemyBullets[shot] instanceof GroundAirEnemyMissile);
                let endTime = new Date();

                if(endTime - airplane.damageTime >= 100) {
                    game.scene.remove(enemyBullets[j].getGeometry());
                    enemyBullets.splice(j, 1);
                    airplane.damageTime = new Date();
                    // Aviao toma dano
                    if (airplane.life > 1) {
                        //Animacao de dano
                        gsap.to(airplane.getGeometry().scale, { x:0.3, y: 0.3, z: 0.3, duration: 0.1 });
                        await sleep(100)
                        gsap.to(airplane.getGeometry().scale, { x:1, y: 1, z: 1, duration: 0.1 });

                        if (isGroundMissile)
                            airplane.decreaseLife(2);
                        else
                            airplane.decreaseLife(1);
                    }
                    else { // Aviao morre
                        //Animação de colisão
                        gsap.to(airplane.getGeometry().scale, { x:0, y: 0, z: 0, duration: 0.25 });
                        await sleep(300);
                        fullReset();
                        defeat();
                    }
                    j--;
                }
            }
        }
    }

    //Removendo misseis inimigos que sairam da tela
    for(var i = 0; i < enemyBullets.length; i++) {
        if(enemyBullets[i].sphere.position.z > game.cameraHolder.position.z) {
            game.scene.remove(enemyBullets[i].getGeometry());
            enemyBullets.splice(i, 1);
        }
    }

    //Removendo mísseis que saíram da tela
    for(var i = 0; i < bullets.length; i++) {
        if(bullets[i].getGeometry().position.z < (game.cameraHolder.position.z - 250) || bullets[i].getGeometry().position.y < -1) {
            game.scene.remove(bullets[i].getGeometry());
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
            enemyBullet.update(airplane);
        });
        
        //Movimento do avião
        airplane.update(SPEED);

        main_scenario.update(game.cameraHolder);
        game.update();

        game.cameraHolder.position.z -= SPEED;
        game.light.position.z -= SPEED;

        //Movimento dos inimigos
        checkBoundariesAndCollisions();
    }
    if (game.isGodMode) {
        infoBox.changeMessage("God Mode ON");  
    }
    else {
        infoBox.changeMessage("God Mode OFF");
    }
    requestAnimationFrame(render);
    game.renderer.render(game.scene, game.camera) // Render scene
}
