import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import scriptjs from 'scriptjs'

const defaultEditorConfig = {
  toolbar: [
    { name: 'source', items: ['Source'] },
    { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord'] },
    { name: 'styles', items: ['Format'] },
    { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat'] },
    { name: 'links', items: ['Link', 'Unlink'] },
    { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote'] },
    { name: 'insert', items: ['Image'] },
    { name: 'tools', items: ['Maximize'] }
  ]
}

export default class CKEditor extends Component {
  static propTypes = {
    content: PropTypes.any.isRequired,
    onChange: PropTypes.func.isRequired,
    editorConfig: PropTypes.object,
    activeClass: PropTypes.string
  }

  static defaultProps = {
    content: '',
    activeClass: ''
  }

  initEditor () {
    this.editorInstance = window.CKEDITOR.appendTo(
      ReactDOM.findDOMNode(this),
      { ...defaultEditorConfig, ...this.props.editorConfig },
      this.props.content
    )

    // 不能使用 change 事件，因为会导致光标跳动
    this.editorInstance.on('change', () => {
      // call callback if present
      const content = this.editorInstance.getData()
      if (content !== this.props.content) {
        this.content = content
        this.props.onChange(content)
      }
    })
  }

  componentDidMount () {
    if (window.CKEDITOR) {
      this.initEditor()
    } else {
      scriptjs(`${AECONST.CDN_JS_BASE}ckeditor/ckeditor.js`, () => {
        this.initEditor()
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    const { content } = nextProps
    if (content !== this.content) {
      if (this.editorInstance) {
        this.editorInstance.setData(content)
      }
    }
  }

  shouldComponentUpdate () {
    // 不需要重新渲染
    return false
  }

  render () {
    return <div className={this.props.activeClass} />
  }
}
