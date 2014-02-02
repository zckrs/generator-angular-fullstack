'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var angularUtils = require('./util.js');

var Generator = module.exports = function Generator() {
  yeoman.generators.NamedBase.apply(this, arguments);

  this.cameledName = this._.camelize(this.name);
  this.classedName = this._.classify(this.name);

  this.sourceRoot(path.join(__dirname, 'templates/express'));

  this.scriptSuffix = '.js';
};

util.inherits(Generator, yeoman.generators.NamedBase);

Generator.prototype.moduleTemplate = function (src, dest) {
  yeoman.generators.Base.prototype.template.apply(this, [
    src + this.scriptSuffix,
    path.join('lib', dest.toLowerCase() + this.scriptSuffix)
  ]);
};

Generator.prototype.generateSource = function (moduleTemplate, targetDirectory) {
  this.moduleTemplate(moduleTemplate, path.join(targetDirectory, this.name));
};
