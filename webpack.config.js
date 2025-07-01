const webpack = require('webpack');

module.exports = {
  resolve: {
    alias: {
      'chart.js/auto': 'chart.js'
    },
    fallback: {
      "canvas": false,
      "bufferutil": false,
      "utf-8-validate": false
    }
  },
  externals: {
    canvas: 'canvas'
  }
};
