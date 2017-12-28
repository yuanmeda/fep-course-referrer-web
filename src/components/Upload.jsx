/**
 * @function  上传（file、image）,直接禁用了预览功能，若要开启，直接添加配置onPreview= this.preview 添加相应预览界面切图
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @params   {
 *   type: '' 上传类型
 *   aceept: '' 接受上传的文件类型
 *   multiple: false 是否允许上传多个文件
 *   listType: 'text' 上传列表的内建样式 支持两种基本样式 text or picture
 *   maxSize: Number 限制文件大小 单位字节
 *   extensions：String  限制文件扩展名
 *   isShowUploadList：false 是否展示文件列表 默认不展示
 *   isDisabledUpload：false 禁用上传
 *   isHideUpload: false  是否隐藏上传按钮
 *   fileList:[] 默认文件列表
 *   onRemove: fun 删除回调
 *   onSuccess: fun 成功回调
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Upload, Icon} from 'fish'
import CommonService from 'services/common'
import Dialog from 'components/dialog'

window.CSSDK.Content.setEnv(process.env.NODE_ENV === 'product' ? 'PRODUCTION' : 'PREPRODUCTION')
window.CSSDK.Content.setChunkSize(1) // cssdk最小1M

const acceptConfig = {
  'excel': {
    accept: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: 'xls,xlsx'
  },
  'image': {
    accept: 'image/*'
  }
}
const defaultConfig = {
  type: 'excel',
  label: '上传', // 上传文件可定制label，(html, text)
  listType: 'text', // 上传列表的内建样式 支持两种基本样式 text or picture
  multiple: false, // 是否允许上传多个文件
  isShowUploadList: false, // 是否展示文件列表 默认不展示
  isDisabledUpload: false, // 是否禁用上传
  isHideUpload: false,
  fileList: []
}

@componentIntl('UploadFile')
export default class UploadFile extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes
  constructor (props) {
    super(props)
    this.config = Object.assign({}, defaultConfig, props)
    this.state = {
      accept: this.config.accept || acceptConfig[this.config.type].accept,
      fileList: this.config.fileList,
      isHideUpload: this.config.isHideUpload,
      isDisabledUpload: this.config.isDisabledUpload,
      priviewImage: '',
      priviewVisible: false
    }
  }

  handleBeforeUpload = (file) => {
    let isVaild = true
    switch (this.config.type) {
      case 'image':
        if (file.type.indexOf('image') === -1) {
          isVaild = false
          Dialog.warning({
            title: '提示',
            content: '只能上传图片文件！'
          })
        }
        break
      case 'excel':
        if (this.state.accept.indexOf(file.type) === -1) {
          isVaild = false
          Dialog.warning({
            title: '提示',
            content: '只能上传Excel文件！'
          })
        }
        break
      default:
        break
    }
    const acceptExtensions = this.config.extensions || acceptConfig[this.config.type].extensions
    if (isVaild && acceptExtensions) {
      const extension = file.name.substr(file.name.indexOf('.') + 1)
      const index = acceptExtensions.indexOf(extension)
      if (index === -1) {
        isVaild = false
        Dialog.warning({
          title: '提示',
          content: `只能上传 ${this.config.type} 扩展名为${acceptExtensions}文件！`
        })
      }
    }
    if (isVaild && this.config.maxSize && this.config.maxSize < file.size) {
      isVaild = false
      Dialog.warning({
        title: '提示',
        content: `文件大小：${file.size}字节，超过指定大小${this.config.maxSize}字节`
      })
    }
    return isVaild ? file : false
  }

  UploadAction = (file) => {
    const that = this
    CommonService.getUploadUrl()
      .then(res => {
        const serviceName = res.dist_path.split('/')[1]
        const remotePath = [res.dist_path, file.name].join('/')
        const session = res.session_id
        const scope = 1

        window.CSSDK.CSClient.upload(serviceName, file, remotePath, scope, {
          // 成功回调
          onNotifySuccess (dentry) {
            const attachment = {
              url: res.access_url.replace('upload', ['download?dentryId=', dentry.dentry_id].join('')),
              source_file_name: file.name,
              id: dentry.dentry_id,
              size: file.size
            }
            const fileMap = {
              uid: dentry.dentry_id,
              name: file.name,
              status: 'done',
              url: attachment.url,
              thumbUrl: attachment.url,
              num: that.config.num ? that.config.num : ''
            }
            if (that.config.multiple) {
              that.state.fileList.push(fileMap)
              that.setState({
                fileList: that.state.fileList
              })
            } else {
              that.setState({
                fileList: [fileMap]
              })
            }
            if (that.config.onSuccess) {
              that.config.onSuccess(attachment, [fileMap])
            }
            return attachment
          },
          // 失败回调
          onNotifyFail () {
          },
          // 进度展示
          onNotifyProgress (progress) {
            progress.percent = (progress.loaded / progress.total) * 100
          }
        },
        null,
        {
          getSession (callback) {
            callback(session)
          }
        })
      })
  }

  onRemove = file => {
    this.setState({
      fileList: this.state.fileList.filter(val => val.uid !== file.uid)
    })
    if (this.props.onRemove) {
      this.props.onRemove(file, this.config.num)
    }
  }

  preview = file => {
    this.setState({
      priviewImage: file.url,
      priviewVisible: true
    })
  }

  handleCancel = () => {
    this.setState({
      priviewVisible: false
    })
  }

  render () {
    const {accept, fileList, isDisabledUpload, isHideUpload} = this.state
    const uploadProp = {
      listType: this.config.listType,
      defaultFileList: fileList,
      disabled: isDisabledUpload,
      fileList: fileList,
      accept: accept,
      beforeUpload: this.handleBeforeUpload,
      data: this.UploadAction,
      multiple: this.config.multiple,
      onRemove: this.onRemove,
      showUploadList: this.config.isShowUploadList
    }
    return (
      this.config.listType === 'text'
        ? <Upload
          {...uploadProp}>
          {this.config.label}
        </Upload>
        : <div className={isHideUpload ? 'slp-btn-select-hide' : ''}>
          <Upload
            {...uploadProp}>
            <Icon type='plus' />
            <div className='ant-upload-text'>上传照片</div>
          </Upload>
        </div>
    )
  }
}
