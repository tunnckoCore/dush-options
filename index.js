/*!
 * dush-options <https://github.com/tunnckoCore/dush-options>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (https://i.am.charlike.online)
 * Released under the MIT license.
 */

'use strict'

var isObject = require('isobject')
var merge = require('merge-deep')
var set = require('set-value')
var get = require('get-value')

module.exports = function dushOptions (options) {
  return function (app) {
    if (app.isRegistered && app.isRegistered('dush-options')) {
      return
    }

    app.options = merge({}, app.options, options)

    app.option = function option (key, value) {
      if (!arguments.length) {
        return app.options
      }
      if (arguments.length === 1 && typeof key === 'string') {
        return get(app.options, key)
      }
      if (isObject(key)) {
        app.options = merge({}, app.options, key)
      } else {
        set(app.options, key, value)
      }
      return app.options
    }

    app.enable = function enable (key) {
      app.option(key, true)
      return app
    }

    app.disable = function disable (key) {
      app.option(key, false)
      return app
    }
  }
}
