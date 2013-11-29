'use strict';

describe('Service: <%= classedName %>', function () {

  // load the service's module
  beforeEach(module('<%= scriptAppName %>'));

  // instantiate service
  var <%= classedName %>,
    $httpBackend,  
    mock<%= classedName %>s = [{
      id: 1,
      name: 'foo'
    }, {
      id: 2,
      name: 'bar'
    }];

  beforeEach(inject(function (_<%= classedName %>_, _$httpBackend_) {
    <%= classedName %> = _<%= classedName %>_;
    $httpBackend = _$httpBackend_;
  }));

  it('should get all <%= cameledName %>s', function () {
    $httpBackend.expectGET('/api/<%= cameledName %>')
      .respond(mock<%= classedName %>s);

    var result = <%= classedName %>.query();

    $httpBackend.flush();

    expect(result[0].name).toEqual('foo');
    expect(result[1].name).toEqual('bar');
  });

  it('should get a single <%= cameledName %>', function () {
    $httpBackend.expectGET('/api/<%= cameledName %>/2')
      .respond(mock<%= classedName %>s[1]);

    var result = <%= classedName %>.get({<%= cameledName %>Id: 2});

    $httpBackend.flush();

    expect(result.name).toEqual('bar');
  });  
});