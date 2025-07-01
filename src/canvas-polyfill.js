// Canvas polyfill for server-side rendering
// This prevents jsdom from trying to load the native canvas module

// Mock canvas module at the require level
if (typeof require !== 'undefined') {
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  
  Module.prototype.require = function(id) {
    if (id === 'canvas') {
      // Return a mock canvas module
      return {
        createCanvas: () => mockCanvas,
        createImageData: () => ({ data: [] }),
        Image: function() {
          return {
            width: 0,
            height: 0,
            onload: null,
            onerror: null,
            src: ''
          };
        }
      };
    }
    return originalRequire.apply(this, arguments);
  };
}

if (typeof global !== 'undefined' && !global.HTMLCanvasElement) {
  // Mock Canvas API for server-side rendering
  const mockCanvas = {
    getContext: () => ({
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createImageData: () => ({ data: [] }),
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
      clip: () => {}
    }),
    width: 0,
    height: 0,
    toDataURL: () => 'data:image/png;base64,',
    toBlob: () => {}
  };

  global.HTMLCanvasElement = function() {
    return mockCanvas;
  };
  
  global.CanvasRenderingContext2D = function() {
    return mockCanvas.getContext();
  };
  
  // Mock document.createElement for canvas
  const originalCreateElement = global.document ? global.document.createElement : () => {};
  if (global.document) {
    global.document.createElement = function(tagName) {
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      return originalCreateElement.call(this, tagName);
    };
  }
}
