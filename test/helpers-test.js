import * as helpers from 'gerrit-mobile/helpers'
import expect from 'expect'
import Immutable from 'immutable'

var state = {
  change: Immutable.fromJS({
    current_revision: 'c',
    revisions: {
      a: { _number: 1 },
      b: { _number: 2 },
      c: { _number: 3 }
    }
  })
}

describe('getPatchSetNumber', function () {
  it('returns 0 for base', function () {
    expect(helpers.getPatchSetNumber(state, 'base')).toEqual(0)
  })
  it('returns correctly for latest', function () {
    expect(helpers.getPatchSetNumber(state, 'latest')).toEqual(3)
  })
  it('returns correctly for a revision id in the array', function () {
    expect(helpers.getPatchSetNumber(state, 'b')).toEqual(2)
  })
  it('returns anything else back to the caller', function() {
    expect(helpers.getPatchSetNumber(state, 'foo')).toEqual('foo')
    expect(helpers.getPatchSetNumber(state, 1)).toEqual(1)
  })
})

describe('getRevisionId', function() {
  it('returns null for base', function() {
    expect(helpers.getRevisionId(state, 'base')).toEqual(null)
  })
  it('returns current_revision latest', function() {
    expect(helpers.getRevisionId(state, 'latest')).toEqual('c')
  })
  it('pulls from map for ps numbers', function() {
    expect(helpers.getRevisionId(state, '1')).toEqual('a')
    expect(helpers.getRevisionId(state, 1)).toEqual('a')
    expect(helpers.getRevisionId(state, '2')).toEqual('b')
    expect(helpers.getRevisionId(state, '3')).toEqual('c')
  })
})

describe('makePath', function() {
  function callMakePath(changeId, revisionId, fileId, baseRevisionId) {
    return helpers.makePath({state, changeId, revisionId, fileId, baseRevisionId})
  }

  it('includes all four sections', function() {
    expect(callMakePath('a', 'b', 'c', 'd')).toEqual('/changes/a/b/c?base=d')
  })
  it('skips base when 0', function() {
    expect(callMakePath('a', 'b', 'c', 0)).toEqual('/changes/a/b/c')
    expect(callMakePath('a', 'b', 'c', 'base')).toEqual('/changes/a/b/c')
  })
})
