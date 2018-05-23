# async-cls

dead simple "continuation-local storage" with Node async_hooks

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/async-cls.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/async-cls
[travis-image]: https://img.shields.io/travis/goto-bus-stop/async-cls.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/async-cls
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install async-cls
```

## Usage

continuation local storage allows you to implicitly make values available to an asynchronous chain of code.
Multiple asynchronous chains of the same code can be running simultaneously, and each will only get access to its own value.

```js
var cls = require('async-cls')
var express = require('express')

var userContext = cls()

var app = express()
app.get('/', function (req, res) {
  userContext.current = req.user
  // you can do any async operation, like filesystem access or waiting for Promises
  // to resolve
  setTimeout(function () {
    respond(res)
  })
})

function respond (res) {
  // `userContext.current` will return the `req.user` value that was set in this async call stack
  res.json({ userId: userContext.current.id })
}
```

## API

### `context = cls()`

Create a new context. A context can hold a single JavaScript value per async context.

### `context.current = value`

Set the value for this async context (call stack).

### `context.current`

Get the value for this async context.

### `context.destroy()`

Destroy the context, removing its `async_hook` and cleaning up any context values. Accessing `context.current` after the context has been destroyed will return `undefined`.

## License

[Apache-2.0](LICENSE.md)
