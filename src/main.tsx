// src/main.tsx - Version corrigée
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Ensure Three.js imports work
import * as THREE from 'three'

// Type window extension properly
declare global {
    interface Window {
        THREE: typeof THREE;
    }
}

window.THREE = THREE;

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);