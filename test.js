var test = require('tape')
var cls = require('./')
var emitter = new (require('events'))()
var fs = require('fs')

test(function (t) {
  t.plan(1)

  var expected = ['/', '/route']
  var actual = []
  var context = cls()

  setTimeout(function () {
    context.current = '/'
    setTimeout(whenever)
  })

  context.current = '/route'
  emitter.on('test', whenever)
  fs.stat(__filename, function () {
    emitter.emit('test')
  })

  function whenever () {
    actual.push(context.current)
    if (actual.length === 2) t.deepEqual(actual.sort(), expected.sort())
  }
})
