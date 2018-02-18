import React from 'react'
import { Link } from 'react-router'
import { getPatchSetNumber, makePath, splitFileId } from './helpers'
import classNames from 'classnames'

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
                    <li><a href="#">Dashboard</a></li>
                    <li><a href='#/search'>Search</a></li>
                    <li role="separator" className="divider"></li>
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
  return (
    <nav className='navbar navbar-default navbar-fixed-bottom'>
      <div className='container'>
        <div className='detail-row footer'>
          <div className='detail-row footer-side'>
            <NavButton location={props.up || ''}>
              <Glyph name='chevron-up' />
            </NavButton>
          </div>
          &nbsp;
          <div className='detail-row footer-side'>
            <RevisionButton {...props}
              showZero={true}
              propToSet='baseRevisionId'
              revisionId={props.state.current.get('baseRevisionId')} />
            <span className='text-primary revision-arrow'>
              <Glyph name='arrow-right' />
            </span>
            <RevisionButton {...props}
              propToSet='revisionId'
              revisionId={props.state.current.get('revisionId')} />
          </div>
          <div className='flex-spacer' />
          <div className='detail-row footer-side'>
            <FileButton {...props} />
          </div>
          &nbsp;
          <div className='detail-row footer-side'>
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

function FileButton(props) {
  return (
    <div className='dropdown file-button'>
      <button type='button' data-toggle='dropdown' className='btn btn-primary btn-outline btn-small dropdown-toggle'>
        <Glyph name='th-list' />
      </button>
      <ul className='dropdown-menu list-group file-menu pull-right'>
      {
        props.state.files.map((file) => {
          const fileId = file.get('name')
          const { filename, path } = splitFileId(fileId)
          const link = makePath({...props.state.current.toJS(), state: props.state, fileId})
          const rowClass = classNames('list-group-item', {
            'current': fileId === props.state.current.get('fileId')
          })
          return (
            <li key={fileId} className={rowClass}>
              <Link to={link}>
                <div className='truncate-text file-list-path'>{path}</div>
                <div className='truncate-text'>{filename}</div>
              </Link>
            </li>
          )
        }).valueSeq()
      }
      </ul>
    </div>
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
            const pathParams = { ...props, ...props.state.current.toJS() }
            pathParams[props.propToSet] = i
            return (
              <li key={i}
                className='list-group-item'>
                <Link to={makePath(pathParams)}>
                  {i}
                </Link>
              </li>
            )
          }).reverse()
          return foo
        }())
      }
      </ul>
    </div>
  )
}
