/*!
 * dush-options <https://github.com/tunnckoCore/dush-options>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (https://i.am.charlike.online)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var test = require('mukla')
var options = require('./index')

var dush = require('dush')
var methods = require('dush-methods')
var isRegistered = require('minibase-is-registered')

function factory () {
  return dush().use(methods()).use(isRegistered())
}

var app = factory()

test('should have `.option`, `.enable`, `.disable` methods', function (done) {
  app.use(options())

  test.strictEqual(typeof app.options, 'object')
  test.strictEqual(typeof app.option, 'function')
  test.strictEqual(typeof app.enable, 'function')
  test.strictEqual(typeof app.disable, 'function')
  done()
})

test('should `.enable` an option', function (done) {
  app.enable('settle')

  test.strictEqual(app.options.settle, true)
  done()
})

test('should `.disable` an option', function (done) {
  var app = factory()
  app.use(options())

  app.disable('foobar')
  app.disable('quxies')

  test.deepStrictEqual(app.options, {
    foobar: false,
    quxies: false
  })
  done()
})

test('should merge `opts` pass to plugin with `app.options`', function (done) {
  var app = factory()
  app.use(function (app) {
    app.options = {}
    app.options.foo = 'bar'
  })

  app.use(options({ bar: 'qux' }))

  test.deepStrictEqual(app.options, { foo: 'bar', bar: 'qux' })
  done()
})

test('should not call plugin if has app.isRegistered and already registered', function (done) {
  var app = factory()

  app.use(options({ aa: 'bb' }))
  test.deepStrictEqual(app.options, { aa: 'bb' })

  app.use(options({ bb: 'qux' }))
  test.deepStrictEqual(app.options, { aa: 'bb' })
  done()
})

test('should `.option()` with no arguments return app.options', function (done) {
  var opts = { init: 123 }

  var app = factory().use(options(opts))
  test.deepStrictEqual(app.options, opts)

  var res = app.option()
  test.deepStrictEqual(res, opts)
  test.deepStrictEqual(app.options, res)
  done()
})

test('should `.option(key)` get an option, support dot notation', function (done) {
  var app = factory().use(options({ aa: { bb: 'cc' } }))

  test.strictEqual(app.option('aa.bb'), 'cc')
  test.deepStrictEqual(app.option('aa'), { bb: 'cc' })
  done()
})

test('should `.option(object)` merge the object with app.options', function (done) {
  var app = factory().use(options({
    beep: 'boop'
  }))
  app.option({ qux: 222 })

  test.deepStrictEqual(app.options, { beep: 'boop', qux: 222 })
  done()
})

test('should `.option(key, value)` set option, support dot notation', function (done) {
  var app = factory()
  app.use(options({
    qux: 22,
    bar: {
      baz: 333
    }
  }))

  app.option('bar.baz', 555)
  app.option('bar.qux', 555)
  app.option('foo', 'bar')
  app.option('qux', 'qux')

  test.deepStrictEqual(app.options, {
    bar: {
      baz: 555,
      qux: 555
    },
    foo: 'bar',
    qux: 'qux'
  })
  done()
})
