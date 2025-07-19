// React UIKit entry point for Hamster Hunter
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HamsterHunterUI } from './UIKitApp.jsx';

console.log('🎮 Starting Hamster Hunter with UIKit UI...');

// Comprehensive React 19 + React Three Fiber compatibility fixes
const originalError = console.error;
const originalWarn = console.warn;

// Filter out various React Three Fiber compatibility warnings
console.error = (...args) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  
  // Suppress jsx attribute warnings
  if (message.includes('jsx') && 
      (message.includes('non-boolean attribute') || 
       message.includes('Received `true`') ||
       message.includes('jsx="true"') ||
       message.includes('boolean attribute'))) {
    return;
  }
  
  // Suppress other React Three Fiber warnings
  if (message.includes('validateProperty') && message.includes('jsx')) {
    return;
  }
  
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  
  // Suppress jsx attribute warnings
  if (message.includes('jsx') && 
      (message.includes('attribute') || 
       message.includes('prop') ||
       message.includes('boolean'))) {
    return;
  }
  
  originalWarn.apply(console, args);
};

// Global error boundary for React Three Fiber
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && 
      event.error.message.includes('jsx') && 
      event.error.message.includes('attribute')) {
    console.log('🚧 React Three Fiber jsx warning suppressed');
    event.preventDefault();
    return false;
  }
});

// Create React root and render the UIKit system
const container = document.getElementById('root') || document.body;
const root = createRoot(container);

// Clear any existing content
container.innerHTML = '';

// Render the UIKit-based app
root.render(<HamsterHunterUI />);

console.log('✅ UIKit system initialized!'); 