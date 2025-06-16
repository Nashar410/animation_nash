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

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)