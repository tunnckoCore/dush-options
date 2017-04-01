/*!
 * dush-options <https://github.com/tunnckoCore/dush-options>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (https://i.am.charlike.online)
 * Released under the MIT license.
 */

'use strict'

var isObject = require('isobject')
var mixin = require('mixin-deep')
var set = require('set-value')
var get = require('get-value')

/**
 * > A plugin for [dush][]/[minibase][]/[base][] that adds `.option`, `.enable` and `.disable`
 * methods to your app. You can pass `options` to be merged with `app.options`
 *
 * **Example**
 *
 * ```js
 * var dush = require('dush')
 * var options = require('dush-options')
 *
 * var app = dush()
 *
 * // some initial options
 * var opts = { foo: 'bar' }
 *
 * app.use(options(opts))
 *
 * console.log(app.options) // => { foo: 'bar' }
 *
 * console.log(app.option()) // => { foo: 'bar' }
 * console.log(app.option) // => function
 *
 * console.log(app.enable) // => function
 * console.log(app.disable) // => function
 * ```
 *
 * @param  {Object} `options` optional, initial options to set to `app.options` property
 * @return {Function} a plugin function, pass it to `.use` method of [dush][]/[minibase][]/[base][]
 * @api public
 */

module.exports = function dushOptions (options) {
  return function (app) {
    if (app.isRegistered && app.isRegistered('dush-options')) {
      return
    }

    app.options = mixin({}, app.options, options)

    /**
     * > Set or get an option(s). Support dot notation syntax too.
     * If there are no arguments it returns `app.options`.
     * If `key` is string and no `value` argument, it gets that property
     * from the `app.options` object - using [get-value][],
     * so `app.option('foo.bar.qux')`. If `key` is object it is merged
     * with `app.options` using [mixin-deep][]. If both `key` and `value` is given
     * then it sets `value` to `key` property, using [set-value][] library.
     *
     * **Example**
     *
     * ```js
     * var app = dush()
     * app.use(options({ initial: 'props' }))
     *
     * console.log(app.options) // => { initial: 'props' }
     * console.log(app.option()) // => { initial: 'props' }
     *
     * app.option({ foo: 'bar' })
     * console.log(app.options)
     * // => { initial: 'props', foo: 'bar' }
     *
     * app.option('qux', 123)
     * console.log(app.options)
     * // => { initial: 'props', foo: 'bar', qux: 123 }
     *
     * app.option('aa.bb.cc', 'dd')
     * console.log(app.options)
     * // => {
     * //  initial: 'props',
     * //  foo: 'bar',
     * //  qux: 123,
     * //  aa: { bb: { cc: 'dd' } }
     * // }
     *
     * console.log(app.option('aa.bb')) // => { cc: 'dd' }
     * console.log(app.option('aa')) // => { bb: { cc: 'dd' }
     * console.log(app.option('foo')) // => 'bar'
     * ```
     *
     * @param  {String|Object} `key` path to some option property, e.g. `a.b.c`
     * @param  {any} `value` if `key` is string, any value to set to `key` property
     * @return {Object} _clone_ of the modified `app.options` object, or some `key` value
     * @api public
     */

    app.option = function option (key, value) {
      if (!arguments.length) {
        app.emit('option', app.options)
        // option:getAll app.options
        return app.options
      }
      if (arguments.length === 1 && typeof key === 'string') {
        var val = get(app.options, key)
        app.emit('option', app.options, key, val)
        // option:get key
        return val
      }
      if (isObject(key)) {
        app.emit('option', app.options, key)
        // option:setAll key
        app.options = mixin({}, app.options, key)
      } else {
        app.emit('option', app.options, key, value)
        // option:set key, value
        set(app.options, key, value)
      }
      return app.options
    }

    /**
     * > Enables a `key` to have `true` value. It is simply just
     * a shortcut for `app.option('foo', true)`.
     *
     * **Example**
     *
     * ```js
     * app.use(options())
     * console.log(app.options) // => {}
     *
     * app.enable('foo')
     * console.log(app.options) // => { foo: true }
     *
     * app.enable('qux.baz')
     * console.log(app.options) // => { foo: true, qux: { baz: true } }
     * ```
     *
     * @param  {String} `key` a path to property to enable
     * @return {Object} always self for chaining
     * @api public
     */

    app.enable = function enable (key) {
      app.emit('enable', key)
      app.option(key, true)
      return app
    }

    /**
     * > Disable a `key` to have `false` value. It is simply just
     * a shortcut for `app.option('zzz', false)`.
     *
     * **Example**
     *
     * ```js
     * app.use(options())
     * console.log(app.options) // => {}
     *
     * app.enable('foo')
     * console.log(app.options) // => { foo: true }
     *
     * app.disable('foo')
     * console.log(app.options) // => { foo: false }
     *
     * app.enable('qux.baz')
     * console.log(app.options.qux) // => { baz: true }
     *
     * app.disable('qux.baz')
     * console.log(app.options.qux) // => { baz: false }
     * ```
     *
     * @param  {String} `key` a path to property to disable
     * @return {Object} always self for chaining
     * @api public
     */

    app.disable = function disable (key) {
      app.emit('disable', key)
      app.option(key, false)
      return app
    }
  }
}
