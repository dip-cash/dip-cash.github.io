import * as THREE from "three";
import { ColladaLoader } from "ColladaLoader";
import { OrbitControls } from "OrbitControls"

const PROGRESS_BY_ID = document.getElementById(
    "progress"
);

const SCENE_BY_ID = document.getElementById(
    "scene"
);

const FOV = 30;
const FRUSTUM = [0.1, 1000];

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(FOV, getSceneAspect(), ...FRUSTUM);

camera.position.set(
    4.472,
    4.472,
    -4.472
);

const renderer = new THREE.WebGL1Renderer({
    canvas: document.querySelector("#scene"),
    antialias: true
});

const geometry = new THREE.SphereGeometry(1);
const material = new THREE.MeshBasicMaterial({
    color: 0x282828
});
const sphere = new THREE.Mesh(
    geometry,
    material
);
scene.add(sphere);

const loadingManager = new THREE.LoadingManager();

const loader = new ColladaLoader(loadingManager);
loader.load(
    "/models/mesh.dae",
    function (collada) {
        const object = collada.scene;
        object.children[0].material = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 1
        });
        scene.add(object);
    }
);

const spotlight = new THREE.SpotLight(
    0xFFFFFF
);
spotlight.position.set(0, 10, 0);
spotlight.angle = 0
scene.add(spotlight);

renderer.setClearColor(0x282828);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

animate();

function animate() {
    requestAnimationFrame(animate);
    
    resizeScene();
    updateSpotlight();
    controls.update();

    renderer.render(scene, camera);
}

loadingManager.onProgress = function(path, loaded, total) {
    PROGRESS_BY_ID.value = (loaded / total) * 100;
}

loadingManager.onError = function(path) {
    PROGRESS_BY_ID.style.accentColor = "#FF0000";
    PROGRESS_BY_ID.value = 100;
}

function getSceneWidth() {
    return SCENE_BY_ID.getBoundingClientRect().width;
}

function getSceneHeight() {
    return SCENE_BY_ID.getBoundingClientRect().height;
}

function getSceneAspect() {
    return getSceneWidth() / getSceneHeight()
}

function updateSpotlight() {
    let x = camera.position.x;
    let y = camera.position.y;
    let z = camera.position.z;
    
    let locus = sqrt(sq(z) + sq(sqrt(sq(x) + sq(y))))
    let cone = max(min(locus / sqrt(1250), 2), 0.2);
    spotlight.angle = cone;
}

function resizeScene() {
    let width = getSceneWidth();
    let height = getSceneHeight();
    let aspect = getSceneAspect();

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(aspect);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
}