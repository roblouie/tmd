import * as THREE from 'three';

import { TMD } from "./tmd/tmd";
import { VRAM } from "./vram/vram";
import { TMDToThreeJS } from './threejs-converters/tmd-to-threejs';
import { TIM } from './tim/tim';
import { timLoader } from './loaders/tim-loader';
import { tmdLoader } from './loaders/tmd-loader';

//THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
const renderer = new THREE.WebGLRenderer(); 
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xff00ff);
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 7000);
camera.position.z = 0;

let textureImageData;
let vram;
let tims;
let canvasContext;

window.onload = async () => {
  canvasContext = (document.querySelector('#texture-canvas') as HTMLCanvasElement).getContext('2d');

  const parseButton = document.getElementById("parse");
  parseButton.onclick = onButtonClick;

  const vramParseButton = document.getElementById("vram-parse");
  vramParseButton.onclick = onVramParse;

  const timParseButton = document.getElementById('tim-parse');
  timParseButton.onclick = onTimParse;

  //document.onkeyup = changeObject();
  //const timData = await openFile('assets/DINO.TIM');
  //tims = timLoader.getTIMsFromTIMFile(timData);
  

  // const leftmostX = tims.map(tim => tim.pixelDataHeader.vramX).sort()[0];

  // tims.forEach(tim => {
  //   const posOffset = (tim.pixelDataHeader.vramX - leftmostX) * 2;
  //   const imageData = tim.createImageData();
  //   canvasContext.putImageData(imageData, posOffset, tim.pixelDataHeader.vramY);
  //   console.log(tim.texturePage);
  // });

  // console.log(tims[0]);

  //const tmdData = await openFile('assets/DINOBASE.TMD');
  // // const vramData = await openFile('assets/vram.bin');
  // // vram = new VRAM(vramData);
  //const tmd = new TMD(tmdData);
  //drawTMD(tmd);
  // //const test2 = test[3].createImageData();
  
}

function onTimParse() {
  const fileInput = document.getElementById("tim-file-input") as HTMLInputElement;
  const files = fileInput.files;
  const reader = new FileReader();
  reader.onload = () => {
    //tims = [new TIM(<ArrayBuffer>reader.result)] //
    tims = timLoader.scanForTIMs(<ArrayBuffer>reader.result);
    console.log(tims[0]);

    let xPos = 0;
    let yPos = 0;
    
    tims.forEach((tim: TIM) => {
      const imageData = tim.createImageData();
      if (imageData) {

        canvasContext.putImageData(imageData, xPos, yPos);
        xPos += imageData.width;

        if (xPos >= canvasContext.canvas.width) {
          xPos = 0;
          yPos += 256;
        }

      }
      
      console.log(tim.texturePage);
    })
  }

  reader.readAsArrayBuffer(files[0]);
}

function onVramParse() {
  const fileInput = document.getElementById("vram-file-input") as HTMLInputElement;

  const files = fileInput.files;

  const reader = new FileReader();

  reader.onload = function () {
    vram = VRAM.fromBeetlePSXSaveState(<ArrayBuffer>reader.result);

    //saveFile(vram.arrayBuffer, 'vram.bin');
    
    textureImageData = vram.getTexturePageImageData(8, 10, 0, 480);
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
    const tmds = tmdLoader.scanForTMDs(reader.result as ArrayBuffer);

    console.log(tmds);

    if (tmds.length > 0) {
      drawTMD(tmds[0]);
    }

    // const tmd = new TMD(reader.result as ArrayBuffer);
    // const matching = tmd.objects[0].primitives.filter(primitive => primitive.packetData.u0);
    // console.log(tmd);
    // console.log(matching);

    // drawTMD(tmd);
  }

  reader.readAsArrayBuffer(files[0]);
}

let i = 0;
let meshes;

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
  

  const converter = new TMDToThreeJS();
  meshes = converter.convertWithTMDOnly(tmd);

  meshes[0].geometry.scale(0.2, 0.2, 0.2);
  meshes.forEach(mesh => scene.add(mesh));
  //scene.add(mesh);
  renderer.render(scene, camera);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  meshes.forEach(mesh => {
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.005;
  });
  
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