'use strict';

const SolutionExplorerService = require('./dist/index').SolutionExplorerService;

function registerInContainer(container) {
  container.register('SolutionExplorer', SolutionExplorerService)
    .dependencies('SolutionExplorer.Repository');
}

module.exports.registerInContainer = registerInContainer;
