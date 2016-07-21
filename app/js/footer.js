import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import actions from './actions'

export function glyph(name) {
  const className = 'glyphicon glyphicon-' + name
  return (
    <span className={className} />
  )
}
export function makeLink(location, content = 'Link') {
  return (
    <Link
      className='btn btn-primary btn-outline navbar-btn'
      to={location}>
      {content}
    </Link>
  )
}

function User(props, state) {
  let fragment = []
  if (props.state && props.state.user) {
    fragment = [
      <a className='user-username dropdown-header' key='user'>Logged in as {props.state.user.get('username')}</a>
    ]
  }
  return (
    <div className='user'>
      {fragment}
    </div>
  )
}

export class Header extends React.Component {
  componentDidMount() {
    // code smell:
    // using global version of $ to ensure we've got bootstrap
    // installed on it
    $('.dropdown-toggle').dropdown() // eslint-disable-line no-undef
  }

  render() {
    return (
      <nav className='navbar navbar-default navbar-fixed-top'>
        <div className='container fill'>
          <div className='bg-primary fill'>
            <div className='container header'>
              <div className='fill'>
                { this.props.content }
              </div>
              <div className='pull-right'>
                <div className='dropdown'>
                  <button style={{backgroundColor: '#FFF'}}
                    className='btn btn-primary btn-outline navbar-btn dropdown-toggle' type='button' data-toggle='dropdown'>
                    <span className='glyphicon glyphicon-menu-hamburger'></span>
                  </button>
                  <ul className='dropdown-menu pull-right'>
                    <li><User {...this.props} /></li>
                    <li><a href='#' onClick={this.props.logout}>Logout</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  }
}

export function Footer(props, state) {
  return (
    <nav className='navbar navbar-default navbar-fixed-bottom'>
      <div className='container navbar-header footer'>
        { props.leftNav }
        <div className='pull-right'>
          { props.rightNav }
        </div>
      </div>
    </nav>
  )
}

export default {
  glyph,
  makeLink,
  Header,
  Footer
}
