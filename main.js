import { BIMViewer } from './BIMViewer.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize BIM viewer
    const viewer = new BIMViewer('viewer-container');
    
    // Set up event listeners for buttons
    document.getElementById('load-model').addEventListener('click', () => {
        // In a real application, you would use a file picker
        // For this example, we'll just load a sample model
        const modelUrl = prompt('Enter model URL or choose from samples:', 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf');
        
        if (modelUrl) {
            viewer.loadModel(modelUrl);
        }
    });
    
    document.getElementById('wireframe-toggle').addEventListener('click', () => {
        viewer.toggleWireframe();
    });
    
    document.getElementById('section-toggle').addEventListener('click', () => {
        viewer.toggleSection();
    });
    
    // For demonstration, you could load a default model
    // viewer.loadModel('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf');
}); 