import React from 'react'
import { connect } from 'react-redux'

import Changes from './components/changes'
import Loading from './components/loading'
import actions from './actions'
import * as nav from './nav'

require('../css/app.css')

function SearchHeader(props, state) {
  return (
    <nav.Header {...props} content={
      <div className='file-name file-header-info'>
        Search
      </div>
    } />
  )
}

class SearchBox extends React.Component {
  constructor() {
    super()
    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit(event) {
    event.preventDefault()
    const query = this.refs.searchbox.value
    if (query !== '' && query !== this.props.state.current.get('search')) {
      this.props.loadSearch(query)
    }
  }

  render() {
    const currentSearch = this.props.state.current.get('search')
    return (
      <div className='search-header'>
        <form className='form-inline' onSubmit={this.onSubmit}>
          <input
            type='search'
            ref='searchbox'
            className='form-control'
            placeholder='Search'
            defaultValue={currentSearch}
          />
        </form>
      </div>
    )
  }
}

function SearchResults(props, state) {
  if (!props.state.app.get('searchesInProgress').isEmpty()) {
    return (<Loading />)
  } else if (props.state.searchResults.isEmpty()) {
    return (<div />)
  } else {
    return (
      <Changes
        label={`Results for "${props.state.current.get('search')}"`}
        changes={props.state.searchResults}
      />
    )
  }
}

class Search extends React.Component {
  render() {
    return (
      <div id='dashboard'>
        <SearchHeader { ...this.props } />
        <div className='dashboard-content container'>
          <SearchBox { ...this.props } />
          <SearchResults { ...this.props } />
        </div>
      </div>
    )
  }
}

export default connect(
  (state) => ({ state }),
  actions
)(Search)
