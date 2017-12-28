import React from 'react'

export default (scope, __) => Promise.resolve({
  permission: -1,
  bread: {
    title: __('404'),
    icon: 'frown'
  },
  component () {
    return <div>页面丢失了</div>
  }
})
