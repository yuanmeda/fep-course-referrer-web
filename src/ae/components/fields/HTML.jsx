import React from 'react'
import AEComponentField from 'ae/components/Field'
import CKEditor from 'ae/components/vendors/CKEditor'

/**
 * 富文本字段
 * CKEDITOR 配置文档：https://docs.ckeditor.com/ckeditor4/docs/#!/api/CKEDITOR.config
 */
export default class AEComponentFieldHTML extends AEComponentField {
  displayRender ({ value }) {
    return (
      <div dangerouslySetInnerHTML={{ __html: value }} />
    )
  }

  editRender ({ value }) {
    return (
      <CKEditor {...this.config}
        content={value}
        onChange={this.handleChange} />
    )
  }
}
