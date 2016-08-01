import {handleActions} from 'redux-actions'
import {combineReducers} from 'redux-immutable'
import Immutable, { Map } from 'immutable'

const clearData = () => Map()

export default combineReducers({
  committed: handleActions({
    setComments: (state, action) => action.payload,
    clearData
  }, Map()),

  draft: handleActions({
    setDraftComments: (state, action) => action.payload,
    clearData,

    updateDraftComment: replaceDraftComment((c, target) => target),

    removeDraftComment: (state, action) => {
      const target = action.payload
      return state.map((file) => file.filter((c) => {
        return c.get('id') !== target.get('id')
      }))
    },

    editComment: replaceDraftComment((c) => c.set('editing', true)),

    cancelEditComment: replaceDraftComment((c) => c.set('editing', false)),

    addComment: (state, action) => {
      const { filename, ...comment } = action.payload
      const newComment = Immutable.fromJS(comment).set('is_new', true)

      if (state.has(filename)) {
        return state.set(filename, state.get(filename).push(newComment))
      } else {
        return state.set(filename, Immutable.fromJS([newComment]))
      }
    }

  }, Map())
})

function replaceDraftComment(fn) {
  return (state, action) => {
    const target = action.payload
    return state.map((file) => file.map((c) => {
      return (c.get('id') === target.get('id')) ? fn(c, target) : c
    }))
  }
}
