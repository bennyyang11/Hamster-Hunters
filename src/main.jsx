// React UIKit entry point for Hamster Hunter
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HamsterHunterUI } from './UIKitApp.jsx';

console.log('🎮 Starting Hamster Hunter with UIKit UI...');

// Filter out React 19 jsx attribute warnings from React Three Fiber
const originalError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && 
      (message.includes('Received `true` for a non-boolean attribute `jsx`') ||
       message.includes('non-boolean attribute `jsx`'))) {
    // Suppress React Three Fiber jsx attribute warnings
    return;
  }
  originalError.apply(console, args);
};

// Create React root and render the UIKit system
const container = document.getElementById('root') || document.body;
const root = createRoot(container);

// Clear any existing content
container.innerHTML = '';

// Render the UIKit-based app
root.render(<HamsterHunterUI />);

console.log('✅ UIKit system initialized!'); 