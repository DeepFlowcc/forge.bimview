import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class BIMViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.wireframeMode = false;
        this.sectionMode = false;
        this.clippingPlane = null;
        
        this.init();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(10, 10, 10);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
        
        // Add orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Add grid
        const grid = new THREE.GridHelper(50, 50, 0x888888, 0x444444);
        this.scene.add(grid);
        
        // Add axes
        const axes = new THREE.AxesHelper(5);
        this.scene.add(axes);
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Start animation loop
        this.animate();
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        
        // Update stats
        if (this.model) {
            const statsElement = document.getElementById('stats');
            if (statsElement) {
                statsElement.innerHTML = `
                    Triangles: ${this.renderer.info.render.triangles}<br>
                    Draw calls: ${this.renderer.info.render.calls}
                `;
            }
        }
    }
    
    loadModel(url) {
        // Clear previous model
        if (this.model) {
            this.scene.remove(this.model);
            this.model = null;
        }
        
        // Determine file type from extension
        const extension = url.split('.').pop().toLowerCase();
        
        if (extension === 'gltf' || extension === 'glb') {
            this.loadGLTF(url);
        } else if (extension === 'ifc') {
            // Show a message about IFC support
            alert('IFC support requires additional setup due to CORS restrictions. For this demo, please use GLTF/GLB models instead.');
            console.warn('IFC loading is disabled in this demo due to CORS restrictions');
        } else {
            console.error('Unsupported file format:', extension);
        }
    }
    
    loadGLTF(url) {
        const loader = new GLTFLoader();
        
        loader.load(
            url,
            (gltf) => {
                this.model = gltf.scene;
                this.scene.add(this.model);
                
                // Center and scale model
                this.centerModel();
                
                console.log('GLTF model loaded successfully');
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading GLTF model:', error);
            }
        );
    }
    
    centerModel() {
        if (!this.model) return;
        
        // Compute bounding box
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center model
        this.model.position.sub(center);
        
        // Adjust camera
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 2;
        this.camera.position.set(distance, distance, distance);
        this.camera.lookAt(0, 0, 0);
        
        // Update controls
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
    
    toggleWireframe() {
        if (!this.model) return;
        
        this.wireframeMode = !this.wireframeMode;
        
        this.model.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = this.wireframeMode;
            }
        });
    }
    
    toggleSection() {
        if (!this.model) return;
        
        this.sectionMode = !this.sectionMode;
        
        if (this.sectionMode) {
            // Create clipping plane
            this.clippingPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
            this.renderer.localClippingEnabled = true;
            
            // Apply clipping plane to all materials
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.material.clippingPlanes = [this.clippingPlane];
                    child.material.needsUpdate = true;
                }
            });
        } else {
            // Remove clipping plane
            this.renderer.localClippingEnabled = false;
            
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.material.clippingPlanes = [];
                    child.material.needsUpdate = true;
                }
            });
        }
    }
}

export { BIMViewer }; 