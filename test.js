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
  var called = false
  app.on('enable', function (key) {
    test.strictEqual(key, 'settle')
    called = true
  })
  app.enable('settle')

  test.strictEqual(app.options.settle, true)
  test.strictEqual(called, true)
  done()
})

test('should `.disable` an option', function (done) {
  var app = factory()
  app.use(options())

  app.disable('foobar')

  var called = false
  app.on('disable', function (key) {
    test.strictEqual(key, 'quxies')
    called = true
  })

  app.disable('quxies')

  test.deepStrictEqual(app.options, {
    foobar: false,
    quxies: false
  })
  test.strictEqual(called, true)
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

test('should emit `option` event with `key` and `val` when work as get', function (done) {
  var app = factory().use(options({
    foo: 'bar'
  }))
  var called = 0
  app.on('option', function (options, key, val) {
    test.deepEqual(options, { foo: 'bar' })
    test.strictEqual(key, 'foo')
    test.strictEqual(val, 'bar')
    called++
  })

  var val = app.option('foo')
  test.strictEqual(val, 'bar')
  test.strictEqual(called, 1)
  done()
})

test('should emit `option` event for dot notation get', function (done) {
  var app = factory().use(options({
    foo: { bar: 'qux' }
  }))

  app.on('option', function (_, key, val) {
    test.strictEqual(key, 'foo.bar')
    test.strictEqual(val, 'qux')
    done()
  })
  app.option('foo.bar')
})

test('should emit `option` event when `app.option()` work as get all options', function (done) {
  var opts = {
    a: 'b',
    c: 'd'
  }

  var called = 0
  var app = factory().use(options(opts))

  app.on('option', function (_opts) {
    test.deepEqual(_opts, opts)
    called++
  })

  var __options__ = app.option()
  test.deepEqual(__options__, opts)
  test.strictEqual(called, 1)
  done()
})

test('should emit `option` event with prev and new options', function (done) {
  var opts = { aaa: 'bbb', ccc: { ddd: 'ddd' } }
  var app = factory().use(options(opts))

  app.on('option', function (prev, curr) {
    test.deepEqual(prev.ccc, { ddd: 'ddd' })
    test.deepEqual(curr.ccc, { xyz: 123 })
    done()
  })
  app.option({
    ccc: { xyz: 123 }
  })
})

test('should emit `option` when set value to key path', function (done) {
  var opts = { a: { bc: 333 } }
  var called = false
  var app = factory().use(options(opts))

  app.on('option', function (prev, key, val) {
    test.deepEqual(prev, opts)
    test.strictEqual(key, 'a.bc')
    test.strictEqual(val, 'foo')
    called = true
  })
  app.option('a.bc', 'foo')

  test.deepEqual(app.options, { a: { bc: 'foo' } })
  test.strictEqual(called, true)
  done()
})
