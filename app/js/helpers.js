import Immutable from 'immutable'

export function immutableFromJS(js) {
  return typeof js !== 'object' || js === null
    ? js
    : Array.isArray(js)
      ? Immutable.Seq(js).map(immutableFromJS).toList()
      : Immutable.Seq(js).map(immutableFromJS).toMap()
}

export function makePath(params) {
  if (!params.changeId) {
    return ''
  }
  let url = '/c/' + params.changeId

  if (!params.revisionId) { return url }

  url = url + '/' + getRevisionId(params.state, params.revisionId)
  if (params.fileId) {
    url = url + '/' + params.fileId
  }
  if (params.baseRevisionId) {
    let basePS = getPatchSetNumber(params.state, params.baseRevisionId)
    if (basePS !== 0) {
      url = url + '?base=' + getPatchSetNumber(params.state, params.baseRevisionId)
    }
  }
  return url
}

export function getPatchSetNumber(state, revisionId) {
  if (!revisionId || revisionId === 'base') {
    return 0
  }
  if (revisionId === 'latest') {
    return state.change.get('revisions').count()
  }
  const revision = state ? state.change.getIn(['revisions', revisionId]) : null
  if (revision) {
    return revision.get('_number')
  }
  return revisionId
}

export function getRevisionId(state, revisionKey) {
  if (true) {
    return getPatchSetNumber(state, revisionKey)
  }
  if (revisionKey === 'base') {
    return null
  }
  if (!state) {
    return revisionKey
  }
  if (!revisionKey || revisionKey === 'latest') {
    return state.change.get('current_revision')
  }
  const revisions = state.change.get('revisions')
  if (revisions) {
    const revisionEntry = state.change.get('revisions').findEntry((v, k) => {
      return v.get('_number').toString() === revisionKey.toString()
    })
    if (revisionEntry) {
      return revisionEntry[0]
    }
  }
  return revisionKey
}
