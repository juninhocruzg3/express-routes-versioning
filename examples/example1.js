var app = require('express')();
var { routesVersioning } = require('../lib/index');

app.listen(3000);

app.get(
  '/test',
  routesVersioning([
    { version: '1.0.0', handler: respondV1 },
    { version: '2.2.1', handler: [respondV2] },
    { version: '2.5.0', handler: [anyMiddleware, respondV3] },
  ])
);

// curl -s -H 'accept-version: 1.0.0' localhost:3000/test
// version 1.0.0 or 1.0 or 1 !
function respondV1(req, res, next) {
  res.status(200).send('ok v1');
}

//curl -s -H 'accept-version: 2.2.0' localhost:3000/test
//Anything from 2.2.0 to 2.2.9
function respondV2(req, res, next) {
  res.status(200).send('ok v2');
}

//curl -s -H 'accept-version: 2.5.0' localhost:3000/test
//curl -s -H 'accept-version: 3.0.0' localhost:3000/test
function anyMiddleware(req, res, next) {
  return next();
}
function respondV3(req, res, next) {
  res.status(200).send('ok v3');
}
