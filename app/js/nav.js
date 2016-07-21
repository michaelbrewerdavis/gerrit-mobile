import React from 'react'
import { Link } from 'react-router'

export function Glyph(props) {
  const className = 'glyphicon glyphicon-' + props.name
  return (
    <span className={className} />
  )
}

export function NavButton(props) {
  return (
    <Link className='btn btn-primary btn-outline navbar-btn' to={props.location}>
      { props.children }
    </Link>
  )
}

function User(props) {
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
      <nav className='navbar navbar-fixed-top bg-primary'>
        <div className='container fill'>
          <div className='bg-primary fill'>
            <div className='container header'>
              <div className='fill truncate-text'>
                { this.props.content }
              </div>
              <div className='pull-right'>
                <div className='dropdown'>
                  <button type='button' data-toggle='dropdown'
                    className='btn btn-primary navbar-btn dropdown-toggle'>
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
      <div className='container'>
        { props.leftNav }
        <div className='pull-right'>
          { props.rightNav }
        </div>
      </div>
    </nav>
  )
}
