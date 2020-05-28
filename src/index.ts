import * as THREE from 'three';

import { TMD } from "./tmd/tmd";
import { FlatNoTextureSolidConverter } from './tmd/threejs-converters/primitives/flat-no-texture-solid.converter'
import { GouradNoTextureSolidConverter } from './tmd/threejs-converters/primitives/gourad-no-texture-solid.converter';
import { FlatTexturedConverter } from './tmd/threejs-converters/primitives/flat-textured.converter';
import { VRAM } from "./vram/vram";
import { TMDToThreeJS } from './tmd/threejs-converters/tmd-to-threejs';

let mesh;
const renderer = new THREE.WebGLRenderer(); 
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xff00ff);
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 6000);
camera.position.z = 400;

let textureImageData;
let vram;

window.onload = () => {
  const parseButton = document.getElementById("parse");
  parseButton.onclick = onButtonClick;

  const vramParseButton = document.getElementById("vram-parse");
  vramParseButton.onclick = onVramParse;

  //document.onkeyup = changeObject();
}

function onVramParse() {
  const fileInput = document.getElementById("vram-file-input") as HTMLInputElement;

  const files = fileInput.files;

  const reader = new FileReader();

  reader.onload = function () {
    vram = VRAM.fromBeetlePSXSaveState(reader.result);
    // textureImageData = vram.getTexturePageImageData(4, 10, 0, 480);
    // console.log(textureImageData);
    // const canvasContext = (document.querySelector('#texture-canvas') as HTMLCanvasElement).getContext('2d');
    // canvasContext.putImageData(textureImageData, 0, 0);
  }

  reader.readAsArrayBuffer(files[0]);
}

function onButtonClick() {
  const fileInput = document.getElementById("myfileinput") as HTMLInputElement;

  const files = fileInput.files;

  const reader = new FileReader();

  reader.onload = function () {
    const tmd = new TMD(reader.result as ArrayBuffer);
    console.log(tmd);

    drawTMD(tmd);
  }

  reader.readAsArrayBuffer(files[0]);
}

function drawTMD(tmd) {
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.set(0, 0, 3000);
  camera.lookAt(0, 0, 0);

  var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
  scene.add(ambientLight);

  // Create directional light and add to scene.
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  //mesh = FlatTexturedSolidConverter.GetMesh(tmd.objects[3], textureImageData);

  const converter = new TMDToThreeJS();
  const meshes = converter.convertWithTMDAndVRAM(tmd, vram);

  mesh = meshes[0];
  mesh.geometry.scale(0.3, 0.3, 0.3);
  scene.add(mesh);
  renderer.render(scene, camera);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.x += 0.005;
  mesh.rotation.y += 0.01;
  renderer.render(scene, camera);
}