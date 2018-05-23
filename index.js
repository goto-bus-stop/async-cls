var hasAsyncHooks = require('has-async-hooks')

if (hasAsyncHooks()) {
  var asyncHooks = require('async_hooks')
  var inspect = require('util').inspect

  module.exports = cls
} else {
  module.exports = function () {
    throw new Error('async-cls: async_hooks is not available.')
  }
}

function cls (opts) {
  if (!opts) opts = {}
  var autoHook = opts.managed !== false

  var store = new Map()
  // List of async context IDs that configured a value,
  // used for automatic hook enable/disable
  var valueAsyncIds = new Set()
  var hook = asyncHooks.createHook({
    init: function (asyncId, type, triggerAsyncId) {
      // Inherit data from parent async context
      if (store.has(triggerAsyncId)) {
        store.set(asyncId, store.get(triggerAsyncId))
      }
    },
    destroy: function (asyncId) {
      store.delete(asyncId)

      // Auto-disable hook if no values are left
      if (autoHook && valueAsyncIds.has(asyncId)) {
        valueAsyncIds.delete(asyncId)
        if (valueAsyncIds.size === 0) hook.disable()
      }
    }
  })

  hook.enable()

  return {
    destroy: destroy,
    set current (value) {
      if (autoHook && valueAsyncIds.size === 0) hook.enable()

      var asyncId = asyncHooks.executionAsyncId()
      store.set(asyncId, value)
      if (autoHook) valueAsyncIds.add(asyncId)
    },
    get current () {
      return current()
    },
    [inspect.custom] (depth, options) {
      if (depth < 0) return '[async-cls]'

      return 'async-cls { current: ' +
        inspect(current(), options.depth === null
          ? options
          : Object.assign({}, options, { depth: options.depth - 1 })
        ) + ' }'
    }
  }

  function destroy () {
    if (!autoHook || valueAsyncIds.size > 0) hook.disable()
    store.clear()
    valueAsyncIds.clear()
  }
  function current () {
    return store.get(asyncHooks.executionAsyncId())
  }
}
