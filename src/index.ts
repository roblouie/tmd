import * as THREE from 'three';

import { TMD } from "./tmd/tmd";
import { VRAM } from "./vram/vram";
import { TMDToThreeJS } from './tmd/threejs-converters/tmd-to-threejs';
import { saveFile } from '@binary-files/save-file';
import { TIM } from './tim/tim';

let mesh;
//THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
const renderer = new THREE.WebGLRenderer(); 
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xff00ff);
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 7000);
camera.position.z = 0;

let textureImageData;
let vram;

window.onload = async () => {
  // const parseButton = document.getElementById("parse");
  // parseButton.onclick = onButtonClick;

  // const vramParseButton = document.getElementById("vram-parse");
  // vramParseButton.onclick = onVramParse;

  //document.onkeyup = changeObject();
  const timData = await openFile('assets/ACASTLE.TIM');
  const test = new TIM(timData);
  const test2 = test.createImageData();
  const canvasContext = (document.querySelector('#texture-canvas') as HTMLCanvasElement).getContext('2d');
  canvasContext.putImageData(test2, 0, 0);
}

function onVramParse() {
  const fileInput = document.getElementById("vram-file-input") as HTMLInputElement;

  const files = fileInput.files;

  const reader = new FileReader();

  reader.onload = function () {
    vram = VRAM.fromBeetlePSXSaveState(<ArrayBuffer>reader.result);

    saveFile(vram.arrayBuffer, 'vram.bin');
    
    textureImageData = vram.getTexturePageImageData(8, 26, 0, 483);
    console.log(textureImageData);
    const canvasContext = (document.querySelector('#texture-canvas') as HTMLCanvasElement).getContext('2d');
    canvasContext.putImageData(textureImageData, 0, 0);
  }

  reader.readAsArrayBuffer(files[0]);
}

function onButtonClick() {
  const fileInput = document.getElementById("myfileinput") as HTMLInputElement;

  const files = fileInput.files;

  const reader = new FileReader();

  reader.onload = function () {
    const tmd = new TMD(reader.result as ArrayBuffer);
    const matching = tmd.objects[0].primitives.filter(primitive => primitive.packetData.u0);
    console.log(tmd);
    console.log(matching);

    drawTMD(tmd);
  }

  reader.readAsArrayBuffer(files[0]);
}

let i = 0;

function drawTMD(tmd) {
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.set(0, 0, 2000);
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
  mesh.geometry.scale(0.2, 0.2, 0.2);
  scene.add(mesh);
  renderer.render(scene, camera);

  // const textureData = mesh.material[i++].map.image;
  // const imageData = new ImageData(textureData.width, textureData.height);
  // textureData.data.forEach((data, i) => imageData.data[i] = data);
  // const canvasContext = (document.querySelector('#texture-canvas') as HTMLCanvasElement).getContext('2d');
  // canvasContext.putImageData(imageData, 0, 0);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.x += 0.005;
  mesh.rotation.y += 0.005;
  renderer.render(scene, camera);
}

function openFile(url: string): Promise<ArrayBuffer> {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "arraybuffer";
  return new Promise((resolve, reject) => {
    xhr.onload = function () {
      if (this.status === 200) {
        resolve(xhr.response)
      } else {
        reject(xhr.response);
      }
    };
    xhr.send();
  });
}