# Express routes versioning

[![Build Status](https://travis-ci.org/juninhocruzg3/express-routes-versioning.svg?branch=master)](https://travis-ci.org/juninhocruzg3/express-routes-versioning)
[![npm version](https://badge.fury.io/js/%40acruzjr%2Fexpress-routes-versioning.svg)](https://badge.fury.io/js/%40acruzjr%2Fexpress-routes-versioning)


A simple node.js module that provides routes versioning for express. You can use middleware easier using a middlewares vector.

## Install
`npm install @acruzjr/express-routes-versioning`

## Usage

Follows semver versioning format. Supports '^, ~' symbols for matching version numbers.

```
   var app = require('express')();
   var { routesVersioning } = require('../lib/index');

   app.listen(3000);

   app.get(
   '/test',
   routesVersioning([
      { version: '1.0.0', handler: respondV1 },
      { version: '2.2.9', handler: [respondV2] },
      { version: '2.5.0', handler: [anyMiddleware, respondV3] },
   ])
   );

   //curl -s -H 'accept-version: 1.0.0' localhost:3000/test
   // version 1.0.0 or 1.0 or 1 !
   function respondV1(req, res, next) {
   res.status(200).send('ok v1');
   }

   //curl -s -H 'accept-version: ~2.2.0' localhost:3000/test
   //curl -s -H 'accept-version: 2.2.9' localhost:3000/test
   //Anything from 2.2.0 to 2.4.9
   function respondV2(req, res, next) {
   res.status(200).send('ok v2');
   }

   //curl -s -H 'accept-version: ^2.2.0' localhost:3000/test
   //curl -s -H 'accept-version: 2.5.0' localhost:3000/test
   //curl -s -H 'accept-version: 3.0.0' localhost:3000/test
   function anyMiddleware(req, res, next) {
   return next();
   }
   function respondV3(req, res, next) {
   res.status(200).send('ok v3');
   }
```

**API**

`routesVersioning(versions)`

**versions** - array, containing VersionHandler list.

```
VersionHandler {
    version: string;
    handler: RequestHandler[] | RequestHandler;
}
```

**version** - string, version in semver format as key

**handler** - RequestHandler[] or RequestHandler - function(s) callback (connect middleware format) to invoke when the request matches the version as value.


**How version is determined for each request ?**

Default behaviour is to use `accept-version` headers from the client.

**How versions are matched ?**

semver versioning format is used to match version, supports ^,~ symbols on the request headers.

## Examples

Examples are available [here](https://github.com/juninhocruzg3/express-routes-versioning/tree/master/examples)

## Test

`npm test`
