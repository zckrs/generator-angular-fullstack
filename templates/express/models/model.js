'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
/**
 * <%= classedName %> Schema
 */
var <%= classedName %>Schema = new Schema({
  name: String,
  completed: Boolean,
  createdAt: Date,
  updatedAt: Date,
});

<%= classedName %>Schema.pre('save', function(next, done){
  if (this.isNew) {
    this.createdAt = Date.now();
  }
  this.updatedAt = Date.now();
  next();
});

mongoose.model('<%= classedName %>', <%= classedName %>Schema);