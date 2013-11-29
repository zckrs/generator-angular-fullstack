'use strict';
var util = require('util');
var ScriptBase = require('../script-base.js');


var Generator = module.exports = function Generator() {
  ScriptBase.apply(this, arguments);
};

util.inherits(Generator, ScriptBase);

Generator.prototype.createControllerFiles = function createControllerFiles() {
  this.generateSourceAndTest(
    'service/resource',
    'spec/resource',
    'services',
    this.options['skip-add'] || false
  );
};