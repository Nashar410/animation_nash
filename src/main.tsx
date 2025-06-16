// 2. Fix pour src/main.tsx - Utiliser un type plus spécifique au lieu de any
import React from 'react'
import App from './App'
import './index.css'

// Ensure Three.js imports work
import * as THREE from 'three'
import {ReactDOM} from "react/ts5.0/v18";

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