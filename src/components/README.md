通用的组件，建议使用以下模式：

```js
import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'

@componentIntl('组件名')
export default class 组件名 extends Component {
  // IE 10 必须要有 contextTypes
  static contextTypes = contextTypes
  static propTypes = propTypes
  ...
}
```
