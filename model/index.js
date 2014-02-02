'use strict';
var util = require('util');
var ExpressBase = require('../express-base.js');


var Generator = module.exports = function Generator() {
  ExpressBase.apply(this, arguments);
};

util.inherits(Generator, ExpressBase);

Generator.prototype.createModel = function createModel() {
  this.generateSource(
    'models/model',
    'models'
  );
};
