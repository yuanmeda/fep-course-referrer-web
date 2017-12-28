/**
 * @function 空数据占位
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-20 21:33:26
 * @version  v0.1 [高精尖业务v0.9.3]
 */

import React from 'react'
import { Component, componentIntl } from 'ae'

@componentIntl('DataEmpty')
export default class DataEmpty extends Component {
  render () {
    return <div className='data-empty'>
      <ins />
      <p>很抱歉，暂时没有数据</p>
    </div>
  }
}
