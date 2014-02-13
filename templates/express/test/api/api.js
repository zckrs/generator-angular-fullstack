'use strict';

/**
 * Module dependencies.
 */

var should = require('should'),
  app = require('../../../server'),
  supertest = require('supertest'),
  port = process.env.PORT || 3000,
  api = supertest('http://localhost:' + port);

describe('/api/awesomeThings', function() {
  it('should return things as JSON', function(done) {
    api.get('/api/awesomeThings')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
      res.body.should.be.instanceof(Array);
      done();
    });
  });
  
  describe('a thing', function() {
    it('should have a name', function(done) {
      api.get('/api/awesomeThings')
      .end(function(err, res) {
        if (err) return done(err);
        var thing = res.body[0];  
        thing.name.length.should.not.be.eql(0);
        done();
      });
    });
  });
});
