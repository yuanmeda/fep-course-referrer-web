import React, { Component, PropTypes } from 'react'
import request from 'ae/shared/request'
import { Upload, Button, Icon } from 'fish'

export default class CSUpload extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    server: PropTypes.object.isRequired,
    defaultFileList: PropTypes.array,
    label: PropTypes.string,
    accept: PropTypes.string,
    multiple: PropTypes.bool
  }

  static defaultProps = {
    defaultFileList: [],
    // TODO 国际化
    label: '选择文件',
    accept: '*/*',
    multiple: false
  }

  constructor (props) {
    super(props)

    this.state = {
      action: null,
      formData: {}
    }

    this.updateState(this.props.server)
  }

  // componentWillUpdate (nextProps, nextState) {
  //   if (!nextState.action) {
  //     this.updateState(nextProps.server)
  //   }
  // }

  updateState (server) {
    const { session, upload } = server
    request(session).then(({ session, path }) => {
      this.setState({
        action: upload.replace('{session}', session),
        formData: {
          scope: 1,
          path
        }
      })
    })
  }

  // 为每个文件生产 formData
  getFormData ({ name }) {
    return Object.assign({ name }, this.state.formData)
  }

  handleChange ({ file, fileList, event }) {
    // 进度中，不处理
    if (!event) {
      this.props.onChange(
        fileList
          // 过滤带 response 的文件
          .filter(file => file.response)
          // 仅使用 dentry_id
          .map(file => file.response.dentry_id)
      )
    }
  }

  render () {
    const { defaultFileList, accept, multiple, label } = this.props
    const { action } = this.state
    return (
      action ? <Upload
        defaultFileList={defaultFileList}
        accept={accept}
        multiple={multiple}
        action={action}
        data={file => this.getFormData(file)}
        onChange={value => this.handleChange(value)}>
        <Button type='ghost'>
          <Icon type='upload' /> {label}
        </Button>
      </Upload> : <span>pending</span>
    )
  }
}
