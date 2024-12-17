var coinSelect = require('../witness')
var fixtures = require('./fixtures/witness')
var tape = require('tape')

fixtures.forEach(function (f) {
  tape(f.description, function (t) {
    if (f.shouldThrow) {
      t.throws(() => {
        coinSelect({
          utxos: f.inputs,
          outputs: f.outputs,
          feeRate: f.feeRate,
          network: f.network,
          changeAddress: f.changeAddress
        })
      },
      new RegExp(f.expected),
      f.description
      )
      t.end()
    } else {
      var actual = coinSelect({
        utxos: f.inputs,
        outputs: f.outputs,
        feeRate: f.feeRate,
        network: f.network,
        changeAddress: f.changeAddress,
        txType: f.txType
      })

      const compareOutputs = (actual, expected) => {
        if (actual.length !== expected.length) {
          console.log('Length mismatch:', {
            actualLength: actual.length,
            expectedLength: expected.length
          })
          return false
        }

        const objectsEqual = (obj1, obj2) => {
          const keys1 = Object.keys(obj1).sort()
          const keys2 = Object.keys(obj2).sort()

          if (keys1.length !== keys2.length) return false

          return keys1.every((key, index) => {
            const val1 = obj1[key]
            const val2 = obj2[key]
            return JSON.stringify(val1) === JSON.stringify(val2)
          })
        }

        return actual.every(actualItem =>
          expected.some(expectedItem => objectsEqual(actualItem, expectedItem))
        )
      }

      t.same(actual.type, f.expected.type)
      t.same(actual.fee, f.expected.fee)
      t.same(actual.feePerByte, f.expected.feePerByte)
      t.same(actual.bytes, f.expected.bytes)
      t.same(actual.max, f.expected.max)
      t.same(actual.totalSpent, f.expected.totalSpent)
      t.same(actual.inputs, f.expected.inputs)
      t.ok(compareOutputs(actual.outputs, f.expected.outputs), 'outputs are the same')
      t.end()
    }
  })
})
