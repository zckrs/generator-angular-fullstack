'use strict';

angular.module('<%= scriptAppName %>')
  .factory('<%= classedName %>', function ($resource) {
    return $resource('/api/<%= cameledName %>/:<%= cameledName %>Id', {}, {
      update: { method:'PUT' }
    });
  });