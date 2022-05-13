import * as THREE from  'three';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
import {
	initRenderer, 
	initCamera,
	initDefaultBasicLight,
	initBasicMaterial,
	InfoBox,
	onWindowResize,
	createGroundPlaneWired
} from "../../libs/util/util.js";

import { Scenario } from './scenario.js';
import { Plane } from './plane.js';

class Game {
  constructor() {
    this.running = false;
    this.scene = new THREE.Scene();    // Create main scene
    this.renderer = initRenderer();    // Init a basic renderer
    this.camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
    this.light = initDefaultBasicLight(this.scene); // Create a basic light to illuminate the scene
    this.orbit = new OrbitControls( this.camera, this.renderer.domElement ); // Enable mouse rotation, pan, zoom etc.  
  }
}

let game = new Game();

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(game.camera, game.renderer)}, false );

let material = initBasicMaterial(); // create a basic material

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
game.scene.add( axesHelper );

// create the ground plane
let main_scenario = new Scenario(50, 50);
game.scene.add(main_scenario.plane);

// Create plane
let plane = new Plane();
game.scene.add(plane.cone);

// create a cube
/*
let cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
let cube = new THREE.Mesh(cubeGeometry, material);
cube.position.set(0.0, 2.0, 0.0);
game.scene.add(cube);
*/

let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();

render();
function render()
{
  requestAnimationFrame(render);
  game.renderer.render(game.scene, game.camera) // Render scene
}
