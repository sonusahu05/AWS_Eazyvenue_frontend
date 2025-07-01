/**
 * Global polyfills for server-side rendering
 * This file must be loaded before any other modules that might use DOM APIs
 */

// Prevent canvas loading in jsdom
process.env.CANVAS_PREBUILT = '0';

// Set up DOMParser and other DOM globals immediately
(() => {
  const jsdom = require('jsdom');
  const { JSDOM } = jsdom;
  
  // Configure jsdom to skip problematic features
  const virtualConsole = new jsdom.VirtualConsole();
  virtualConsole.on('error', () => {
    // Suppress errors
  });
  
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    features: {
      FetchExternalResources: false,
      ProcessExternalResources: false
    },
    virtualConsole,
    pretendToBeVisual: false,
    resources: 'usable'
  });
  
  const window = dom.window;
  
  // Set all DOM globals that might be needed
  global.DOMParser = window.DOMParser;
  global.Document = window.Document;
  global.XMLDocument = window.XMLDocument;
  global.Element = window.Element;
  global.HTMLElement = window.HTMLElement;
  global.Node = window.Node;
  global.Text = window.Text;
  global.Comment = window.Comment;
  global.DocumentFragment = window.DocumentFragment;
  global.XMLHttpRequest = window.XMLHttpRequest;
  
  // Set up a global window reference if needed
  if (typeof global.window === 'undefined') {
    global.window = window;
  }
  
  // Set up document reference
  if (typeof global.document === 'undefined') {
    global.document = window.document;
  }
  
  // Set up navigator polyfill for server-side rendering
  if (typeof global.navigator === 'undefined') {
    global.navigator = {
      userAgent: 'Node.js Server',
      platform: process.platform || 'unknown',
      language: 'en',
      languages: ['en'],
      cookieEnabled: false,
      onLine: true,
      appName: 'Node.js',
      appVersion: process.version || '1.0.0',
      product: 'Gecko'
    };
  }
})();

// Import Zone.js for server-side rendering
// This must be imported after DOM polyfills but before Angular
import 'zone.js/dist/zone-node';
