import React from 'react'
import { Link } from 'react-router'
import { makePath } from '../helpers'

require('../../css/app.css')

function FileListItem(props, state) {
  let className = 'list-group-item'
  const status = props.attrs.get('status')
  if (status === 'A') {
    className = className + ' list-group-item-override list-group-item-success'
  } else if (status === 'D') {
    className = className + ' list-group-item-override list-group-item-danger'
  }
  return (
    <Link className={className} to={makePath(props)}>
      <div className='truncate-text'>{props.fileId}</div>
    </Link>
  )
}

export default function FileList(props, state) {
  let files = props.files || Map()
  files = files.filter((value) => (value.get('name') !== '/COMMIT_MSG'))
  return (
    <div className='container'>
      <h4>Files</h4>
      <div className='panel panel-default'>
        <ul className='list-group file-list'>
        {
          files.map((value) => {
            return <FileListItem {...props} key={value.get('name')} fileId={value.get('name')} attrs={value} />
          }).valueSeq().toArray()
        }
        </ul>
      </div>
    </div>
  )
}
