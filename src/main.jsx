// React UIKit entry point for Hamster Hunter
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HamsterHunterUI } from './UIKitApp.jsx';

console.log('🎮 Starting Hamster Hunter with UIKit UI...');

// Create React root and render the UIKit system
const container = document.getElementById('root') || document.body;
const root = createRoot(container);

// Clear any existing content
container.innerHTML = '';

// Render the UIKit-based app
root.render(<HamsterHunterUI />);

console.log('✅ UIKit system initialized!'); 