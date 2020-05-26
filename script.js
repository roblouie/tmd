import { TMD } from "./tmd/tmd.js";
import { FlatNoTextureSolidConverter } from './tmd/threejs-converters/primitives/flat-no-texture-solid.converter.js'
import { GouradNoTextureSolidConverter } from './tmd/threejs-converters/primitives/gourad-no-texture-solid.converter.js';
import { VRAM } from "./vram/vram.js";

let mesh;
const renderer = new THREE.WebGLRenderer(); 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 400;

let objectIndex;

window.onload = () => {
  const parseButton = document.getElementById("parse");
  parseButton.onclick = onButtonClick;

  const vramParseButton = document.getElementById("vram-parse");
  vramParseButton.onclick = onVramParse;

  //document.onkeyup = changeObject();
}

function onVramParse() {
  const fileInput = document.getElementById("vram-file-input");

  const files = fileInput.files;

  const reader = new FileReader();

  reader.onload = function () {
    const vram = VRAM.fromBeetlePSXSaveState(reader.result);
    const test = vram.getClutColors(0, 480, 4);
    console.log(test);
  }

  reader.readAsArrayBuffer(files[0]);
}

function onButtonClick() {
  const fileInput = document.getElementById("myfileinput");

  const files = fileInput.files;

  const reader = new FileReader();

  reader.onload = function () {
    const tmd = new TMD(reader.result);
    console.log(tmd);

    drawTMD(tmd);
  }

  reader.readAsArrayBuffer(files[0]);
}

function drawTMD(tmd) {
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.set(0, 0, 600);
  camera.lookAt(0, 0, 0);

  var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
  scene.add(ambientLight);

  // Create directional light and add to scene.
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  mesh = FlatNoTextureSolidConverter.GetMesh(tmd.objects[1]);

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