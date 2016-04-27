import Immutable from 'immutable'

export function immutableFromJS(js) {
  return typeof js !== 'object' || js === null
    ? js
    : Array.isArray(js)
      ? Immutable.Seq(js).map(immutableFromJS).toList()
      : Immutable.Seq(js).map(immutableFromJS).toMap()
}
