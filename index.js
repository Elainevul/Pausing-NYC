import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


let scene, camera, renderer, raycaster, mouse;

function addGridAndOriginMarker() {
  let gridHelper = new THREE.GridHelper(200, 200);
  gridHelper.position.set(0, 2.5, 0);
  gridHelper.name = 'gridHelper';
  scene.add(gridHelper);
  
  const sphereGeo = new THREE.SphereGeometry(0.2, 32, 32);
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const originMarker = new THREE.Mesh(sphereGeo, sphereMat);
  originMarker.position.set(0, 2, 0);
  scene.add(originMarker);
}

function loadBox() {
  let boxGeo = new THREE.BoxGeometry();
  let boxMat = new THREE.MeshBasicMaterial({ color: 0xab00ff });
  let cube = new THREE.Mesh(boxGeo, boxMat);
  scene.add(cube);
}

function loadModel(loadingManager) {
  let loader = new GLTFLoader(loadingManager);
  loader.load("./model-0-0.glb", function (gltf) {
    scene.add(gltf.scene);
    gltf.scene.position.set(0, 0, 0);
    gltf.scene.rotateY(-Math.PI / 2);
    gltf.scene.scale.set(0.1, 0.1, 0.1);
  });
}

let cameraPathPosition = 0;
function setupScrollAlongPathControls() {
  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 6, 10.21),
    new THREE.Vector3(-18, 6, 23),
    new THREE.Vector3(-19, 6, 25),
    new THREE.Vector3(-25, 6, 24),
    new THREE.Vector3(-35, 6, 19),
    new THREE.Vector3(-43, 6, 21),
    new THREE.Vector3(-49, 6, 31),
    new THREE.Vector3(-55, 6, 43),
    new THREE.Vector3(-61, 6, 44),
    new THREE.Vector3(-70, 6, 39),
  ]);

  const points = cameraPath.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: "yellow" });
  const line = new THREE.Line(geometry, material);
  line.position.set(0, -0.1, 0);
  scene.add(line);

  camera.position.set(-10, 6, 10.21);
  camera.lookAt(-100, 0, 100);

  // Calculate total scrollable height
  const totalScrollableHeight = window.innerHeight * 5; // Change 5 to control the amount of scroll

  // Set the document height dynamically
  document.body.style.height = `${totalScrollableHeight}px`;

  // Sync the camera position with the page scroll
  window.addEventListener("scroll", () => {
    // Map scroll position (0 - totalScrollableHeight) to (0 - 1)
    cameraPathPosition = window.scrollY / totalScrollableHeight;

    // Clamp to [0, 1] to prevent out-of-bounds errors
    cameraPathPosition = Math.max(0, Math.min(1, cameraPathPosition));

    // Get the camera's new position on the path
    const newCameraPosition = cameraPath.getPointAt(cameraPathPosition);
    camera.position.set(newCameraPosition.x, newCameraPosition.y, newCameraPosition.z);

    // Get the direction the camera should be facing
    const tangent = cameraPath.getTangentAt(cameraPathPosition).normalize();

    // Make the camera face forward
    camera.lookAt(camera.position.clone().add(tangent));
  });
}

function addLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  scene.add(directionalLight);
}

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const gridHelper = scene.getObjectByName('gridHelper');
  const intersects = raycaster.intersectObject(gridHelper, true);

  if (intersects.length > 0) {
    const closestIntersect = intersects[0];
    const position = closestIntersect.point;
    console.log(`交点坐标: x=${position.x.toFixed(2)}, y=${position.y.toFixed(2)}, z=${position.z.toFixed(2)}`);
  }
}


function init() {

  const loadingScreen = document.getElementById('loading-screen');

  // 创建加载管理器
  const loadingManager = new THREE.LoadingManager();
  loadingManager.onLoad = () => {
    loadingScreen.style.display = 'none';
  };
  loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = Math.round((itemsLoaded / itemsTotal) * 100);
    const loadingText = document.getElementById('loading-text');
    loadingText.textContent = `Loading... ${progress}%`;
  };

  scene = new THREE.Scene();
scene.background = new THREE.Color(0xD1E2FF); // 设置背景为浅蓝色

  let aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.01, 500);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('click', onMouseClick); 

  setupScrollAlongPathControls();
  loadModel(loadingManager);
  addGridAndOriginMarker();
  addLights();
  loop();
}

function loop() {
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
}

init();
