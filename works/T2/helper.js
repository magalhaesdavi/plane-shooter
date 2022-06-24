import * as THREE from  'three';
import { degreesToRadians, getMaxSize } from '../../libs/util/util.js';
import { GLTFLoader } from '../../build/jsm/loaders/GLTFLoader.js';

// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale)
{
  var scale = getMaxSize(obj); // Available in 'utils.js'
  obj.scale.set(newScale * (1.0/scale),
                newScale * (1.0/scale),
                newScale * (1.0/scale));
  return obj;
}

export const getPlaneObject = (asset, name) => {
    let object = new THREE.Object3D();
    let loader = new GLTFLoader();

    loader.load( './assets/plane.glb', function ( gltf ) {
        var obj = gltf.scene;
        obj.name = 'Plane';
        obj.translateZ(-5);
        obj.rotateX(degreesToRadians(-90));
        obj.rotateZ(degreesToRadians(180));
        obj.visible = true;
        obj.castShadow = true;
        obj.traverse( function ( child ) {
            if ( child ) {
                child.castShadow = true;
            }
        });

        var obj = normalizeAndRescale(obj, 10);

        object.add(obj);

    }, null, null);

    return object;
};

//esse arquivo de inimigo tem 1.5mb, tem que arranjar outro mais leve
//se tiver bastante inimigo na tela acaba dando umas engasgadas no fps
export const getLineEnemyObject = () => {
    let object = new THREE.Object3D();
    let loader = new GLTFLoader();

    loader.load( './assets/enemy 1.glb', function ( gltf ) {
        var obj = gltf.scene;
        //obj.translateZ(-5);
        //obj.rotateX(degreesToRadians(-90));
        //obj.rotateZ(degreesToRadians(180));
        obj.visible = true;
        obj.castShadow = true;
        obj.traverse( function ( child ) {
            if ( child ) {
                child.castShadow = true;
            }
        });

        var obj = normalizeAndRescale(obj, 10);

        object.add(obj);

    }, null, null);

    return object;
}