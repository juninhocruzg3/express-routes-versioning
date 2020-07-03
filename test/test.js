var { routesVersioning } = require('../lib/index');
var assert = require('assert');
var sinon = require('sinon');

describe('routes versioning', function () {
  var req;
  var res;
  var next;
  beforeEach(function () {
    req = {};
    res = {};
    next = function () {};
  });
  it('calling routesVersioning should return connect style middleware', () => {
    var middleware = routesVersioning([])[0];
    console.log('algo', middleware);
    assert.equal(typeof middleware, 'function');
  });

  it('if version if not provided by client latest version callback should be called', () => {
    var latestVersionSpy = sinon.spy();
    var olderVersion = sinon.spy();
    var middlewares = routesVersioning([
      { version: '1.2.1', handler: sinon.spy() },
      { version: '1.3.1', handler: latestVersionSpy },
    ]);
    middlewares.map((middleware) => middleware(req, res, next));
    assert.ok(olderVersion.notCalled);
    assert.ok(latestVersionSpy.calledOnce);
    assert.ok(latestVersionSpy.calledWith(req, res, next));
  });

  it('if accept-version header is present, appropriate callback should be called', () => {
    var correctSpy = sinon.spy();
    var uncorrectSpy = sinon.spy();
    var middlewares = routesVersioning([
      { version: '1.2.1', handler: correctSpy },
      { version: '1.3.1', handler: uncorrectSpy },
    ]);
    req.headers = {};
    req.headers['accept-version'] = '1.2.1';
    middlewares.map((middleware) => middleware(req, res, next));
    assert.ok(correctSpy.calledOnce);
    assert.ok(uncorrectSpy.notCalled);
    assert.ok(correctSpy.calledWith(req, res, next));
  });
  it('when ~ is used in version, version should matching appropriately', () => {
    var correctSpy = sinon.spy();
    var uncorrectSpy = sinon.spy();
    var middlewares = routesVersioning([
      { version: '1.0.0', handler: uncorrectSpy },
      { version: '1.0.1', handler: uncorrectSpy },
      { version: '1.0.2', handler: correctSpy },
      { version: '1.1.0', handler: uncorrectSpy },
    ]);
    req.headers = {};
    req.headers['accept-version'] = '~1.0.0';
    middlewares.map((middleware) => middleware(req, res, next));
    assert.ok(correctSpy.calledOnce);
    assert.ok(uncorrectSpy.notCalled);
    assert.ok(correctSpy.calledWith(req, res, next));
  });
  it('when ^ is used in version, version should matching appropriately', () => {
    var correctSpy = sinon.spy();
    var uncorrectSpy = sinon.spy();
    var middlewares = routesVersioning([
      { version: '1.0.0', handler: uncorrectSpy },
      { version: '1.0.1', handler: uncorrectSpy },
      { version: '1.0.2', handler: uncorrectSpy },
      { version: '1.1.0', handler: uncorrectSpy },
      { version: '1.1.1', handler: correctSpy },
      { version: '2.0.0', handler: uncorrectSpy },
    ]);
    req.headers = {};
    req.headers['accept-version'] = '^1.0.0';
    middlewares.map((middleware) => middleware(req, res, next));
    assert.ok(correctSpy.calledOnce);
    assert.ok(uncorrectSpy.notCalled);
    assert.ok(correctSpy.calledWith(req, res, next));
  });
  it('when version provided as integer, version should cast to string', function () {
   var correctSpy = sinon.spy();
   var uncorrectSpy = sinon.spy();
   var middlewares = routesVersioning([
     { version: '1.0.0', handler: uncorrectSpy },
     { version: '1.0.1', handler: uncorrectSpy },
     { version: '1.0.2', handler: uncorrectSpy },
     { version: '1.1.0', handler: uncorrectSpy },
     { version: '1.1.1', handler: correctSpy },
     { version: '2.0.0', handler: uncorrectSpy },
   ]);
   req.headers = {};
   req.headers['accept-version'] = '1';
   middlewares.map((middleware) => middleware(req, res, next));
   assert.ok(correctSpy.calledOnce);
   assert.ok(uncorrectSpy.notCalled);
   assert.ok(correctSpy.calledWith(req, res, next));
  });
});
