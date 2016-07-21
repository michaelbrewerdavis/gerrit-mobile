import React from 'react'
import { connect } from 'react-redux'
import actions from './actions'

export default class CreatePassword extends React.Component {
  createPasswordLink() {
    return process.env.GERRIT_HOST + '/#/settings/http-password'
  }

  render() {
    return (
      <div>
        <div>
          It looks like you don't have an HTTP password set up in Gerrit.  Would you like to go create one?
        </div>
        <a target='_blank' href={this.createPasswordLink()} type='button'>Go do it</a>
        <a href='/' type='button'>Reload this page after</a>
      </div>
    )
  }
}
