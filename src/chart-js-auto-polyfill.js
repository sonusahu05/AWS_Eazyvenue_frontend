// Polyfill for chart.js/auto import for PrimeNG compatibility
const chartJs = require('chart.js');

// Export both default and named exports for maximum compatibility
module.exports = chartJs;
module.exports.default = chartJs.Chart || chartJs;
module.exports.Chart = chartJs.Chart;

// Auto-register all components
if (chartJs.registerables) {
  chartJs.Chart.register(...chartJs.registerables);
}
