import React from 'react'
import { Link } from 'react-router'
import { getPatchSetNumber } from './helpers'

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

export function Footer(props) {
  const baseRevision = props.state.current.get('baseRevisionId')
  const currentRevision = props.state.current.get('revisionId')
  return (
    <nav className='navbar navbar-default navbar-fixed-bottom'>
      <div className='container'>
        <div className='detail-row footer'>
          <div className='detail-row footer-side'>
            <NavButton location={props.up || ''}>
              <Glyph name='chevron-up' />
            </NavButton>
          </div>
          <div className='detail-row footer-center'>
            <RevisionButton {...props}
              showZero={true}
              revisionId={props.state.current.get('baseRevisionId')}
              action={(i) => props.action(i, currentRevision)} />
            <span className='text-primary'>
              &nbsp;<Glyph name='arrow-right' />&nbsp;
            </span>
            <RevisionButton {...props}
              revisionId={props.state.current.get('revisionId')}
              action={(i) => props.action(baseRevision, i)} />
          </div>
          <div className='detail-row footer-side'>
            <div className='flex-spacer' />
            {
              props.left ? (
                <NavButton location={props.left || ''}>
                  <Glyph name='chevron-left' />
                </NavButton>
              ) : ''
            }
            <NavButton location={props.right || ''}>
              <Glyph name='chevron-right' />
            </NavButton>
          </div>
        </div>
      </div>
    </nav>
  )
}

function RevisionButton(props) {
  let revisionCount = 0
  if (props.state.change && props.state.change.get('revisions')) {
    revisionCount = props.state.change.get('revisions').size
  }
  const psNumber = getPatchSetNumber(props.state, props.revisionId)
  return (
    <div className='dropdown revision-button'>
      <button type='button' data-toggle='dropdown'
        className='btn btn-primary btn-outline btn-small dropdown-toggle'>
        {psNumber}
      </button>
      <ul className='dropdown-menu list-group revision-menu'>
      {
        (function() {
          const foo = Array.from({length: revisionCount + 1}, (x, i) => {
            if (i === 0 && !props.showZero) { return }
            return (
              <li key={i}
                className='list-group-item'>
                <Link className='' to={props.action(i)}>
                  {i}
                </Link>
              </li>
            )
          })
          return foo
        }())
      }
      </ul>
    </div>
  )
}
