import React from 'react'
import AEComponentField from 'ae/components/Field'
import CSUpload from 'ae/components/vendors/CSUpload'

export default class AEComponentFieldFile extends AEComponentField {
  // 父类使用箭头函数，所以子类也必须使用箭头函数
  // @override
  handleChange = value => {
    const { onChange, field } = this.props
    if (!field.multiple) {
      value = value.pop()
    }
    this.setState({ value })
    onChange && onChange(value)
  }

  _getFileByDentryId (id, URL_PATTERN) {
    return {
      uid: id,
      name: id,
      status: 'done',
      url: URL_PATTERN.replace('{dentryId}', id)
    }
  }

  editRender ({ value }) {
    const { field } = this.props
    const { server, accept, multiple } = field
    const defaultFileList = value ? multiple
      ? value.map(file => this._getFileByDentryId(file, server.download))
      : [this._getFileByDentryId(value, server.download)] : null

    return (
      <CSUpload {...this.config}
        server={server}
        accept={accept}
        multiple={multiple}
        defaultFileList={defaultFileList}
        onChange={this.handleChange} />
    )
  }
}
