import React from 'react'
import { Link } from 'react-router'

require('../../css/app.css')

function pathToFile(changeId, revisionId, filename) {
  return '/changes/' + changeId + '/revisions/' + revisionId + '/files/' + encodeURIComponent(filename)
}

function FileListItem(props, state) {
  let className = 'list-group-item'
  const status = props.attrs.get('status')
  if (status === 'A') {
    className = className + ' list-group-item-override list-group-item-success'
  } else if (status === 'D') {
    className = className + ' list-group-item-override list-group-item-danger'
  }
  return (
    <Link className={className} to={pathToFile(props.changeId, props.revision, props.filename)}>
      <div className='truncate-text'>{props.filename}</div>
    </Link>
  )
}

export default function FileList(props, state) {
  let files = props.files || Map()
  files = files.sortBy((value, key) => key)
  return (
    <div className='container'>
      <h4>Files</h4>
      <div className='panel panel-default'>
        <ul className='list-group file-list'>
        {
          files.map((value, key) => {
            return <FileListItem key={key} filename={key} attrs={value}
              selectFile={props.selectFile}
              changeId={props.changeId}
              revision={props.revision} />
          }).valueSeq().toArray()
        }
        </ul>
      </div>
    </div>
  )
}
