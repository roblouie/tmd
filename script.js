import { TMD } from "./tmd/tmd.js";

window.onload = () => {
  const parseButton = document.getElementById("parse");
  parseButton.onclick = onButtonClick;
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
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, -1000);
  camera.lookAt(0, 0, 0);

  var scene = new THREE.Scene();

  var material = new THREE.LineBasicMaterial({ color: 0x0000ff });

  const vectors = [];

  tmd.objects[0].vertices.forEach(vertex => {
    vectors.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
  });

  var geometry = new THREE.BufferGeometry().setFromPoints(vectors);
  var line = new THREE.Line(geometry, material);

  scene.add(line);
  renderer.render(scene, camera);
}

