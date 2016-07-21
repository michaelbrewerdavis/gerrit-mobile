import React from 'react'
import * as nav from './nav'

export default class CreatePassword extends React.Component {
  createPasswordLink() {
    return '/auth/createPassword'
  }

  render() {
    return (
      <div>
        <nav.Header {...this.props} content={
          <div className='file-name file-header-info truncate-text'>
            Create API Password
          </div>
        } />
        <div className='container create-password'>
          <div className='panel panel-danger'>
            <div className='panel-heading'>
              <h3>It looks like you don't have an HTTP password set up in Gerrit.  Would you like to go create one?</h3>
            </div>
            <div className='panel-body'>
              <p><a className='btn btn-danger btn-lg' target='_blank' href={this.createPasswordLink()} type='button'>Go do it</a></p>
              <p><a className='btn btn-danger btn-outline btn-lg' href='/' type='button'>Reload this page after</a></p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
