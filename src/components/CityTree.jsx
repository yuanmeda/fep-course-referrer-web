/**
 * @function 省市异步加载树形控件（school学校节点默认为叶子节点）
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-14 21:16:37
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *   config: {}, // fish tree配置（http://fish-docs.dev.web.nd/components/tree-cn/）
 *   onSelect:func({ // 选择回调
 *     code, // 组织节点code
 *     id, // 组织id
 *     name,type,isLeaf})
 * }
 */

import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'
import request from 'ae/shared/request'
import { Tree } from 'fish'
const TreeNode = Tree.TreeNode

@componentIntl('CityTree')
export default class CityTree extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes
  constructor (props) {
    super(props)
    this.treeConfig = Object.assign({
    }, props.config)
    this.state = {
      treeData: [], // 树源数据，根据此生成树节点
      defaultSelectedKeys: [], // 默认选中的树节点Key
      selectedNode: null, // 当前选择节点
      controlClassNameNode: {}, // 选中节点样式做控制
      showEmpty: null // 空数据
    }
  }

  componentDidMount () {
    let { showEmpty } = this.state
    const { defaultSelectedKeys } = this.state
    const { onSelect } = this.props
    this.getOrgsData(0).then(orgsData => {
      showEmpty = !(orgsData && orgsData.length)
      if (!showEmpty) {
        defaultSelectedKeys.push(orgsData[0].code)
      }
      onSelect(orgsData[0])
      this.setState({
        treeData: orgsData,
        defaultSelectedKeys,
        showEmpty
      })
    }, () => {
      this.setState({
        showEmpty: true
      })
    })
  }

  /**
   * [getOrgsData 获取行政组织列表]
   * @param  {[Number / String]} parentCode [0表查询省级数据，其它code表查询其子级数据]
   * @return {[Promise]}            [{code, name, type, isLeaf}]
   */
  getOrgsData = parentCode => {
    const config = {
      method: 'get',
      url: `${ORIGINS.FEP}/v1/tenant_admins/tenants/orgs`,
      params: {
        parent_code: parentCode
      }
    }
    return request(config).then(resData => {
      return resData && resData.items.map(item => {
        return {
          id: item.district_code,
          code: item.org_code,
          name: item.org_name,
          type: item.org_type,
          isLeaf: item.org_type === 'school'
        }
      })
    })
  }

  /**
   * [getCurrentNode 深遍历tree，获取当前节点。若传入子数据则填充当前节点children]
   * @param  {[type]} treeData [treeData]
   * @param  {[type]} curKey   [当前节点key]
   * @param  {[type]} children [当前节点子数据]
   * @return {[type]} treeNodeData [当前节点{code,name,type,isLeaf:bool}]
   */
  getCurrentNode = (treeData, curKey, children) => {
    let treeNodeData
    const loop = data => {
      data.map(item => {
        if (item.code === curKey) {
          treeNodeData = item
          if (!item.children && children) {
            item.children = children
          }
        } else if (item.children) {
          loop(item.children)
        }
      })
      return treeNodeData
    }
    return loop(treeData)
  }

  /**
   * [onSelectNode 节点选中回调(selectedNode)]
   * 已选中节点再次点击fish默认取消选中，setTimeout设置为已选中className，选择其它节点时还原className
   * @param  {[type]} selectedKeys [已选中key数组]
   * @param  {[type]} e            [e:{selected: bool, selectedNodes, node, event:'select'}]
   */
  onSelectNode = (selectedKeys, e) => {
    const { selectedNode, controlClassNameNode, treeData } = this.state
    const { onSelect } = this.props
    const nodeKey = e.node.props.eventKey
    const newSelectedNode = this.getCurrentNode(treeData, nodeKey)
    if (selectedNode === newSelectedNode) {
      const selectHandle = e.node.refs.selectHandle
      setTimeout(() => {
        selectHandle.className += ' ant-tree-node-selected'
        this.setState({
          controlClassNameNode: selectHandle
        })
      })
    } else {
      controlClassNameNode.className = 'ant-tree-node-content-wrapper'
      this.setState({
        selectedNode: newSelectedNode,
        controlClassNameNode
      })
      onSelect(newSelectedNode)
    }
  }

  /**
   * [onLoadData 加载节点数据]
   * @param  {[type]} treeNode [当前节点]
   * @return {[type]} Promise
   */
  onLoadData = treeNode => {
    const { treeData } = this.state
    const nodeKey = treeNode.props.eventKey
    return this.getOrgsData(nodeKey).then(orgsData => {
      this.getCurrentNode(treeData, nodeKey, orgsData)
      this.setState({ treeData })
    })
  }

  render () {
    const { treeData, defaultSelectedKeys, showEmpty } = this.state

    if (showEmpty) {
      return null
    }

    const loop = data => {
      return data.map(item => {
        if (item.children) {
          return <TreeNode title={item.name} key={item.code}>{loop(item.children)}</TreeNode>
        }
        return <TreeNode title={item.name} key={item.code} isLeaf={item.isLeaf} />
      })
    }

    const treeNodes = loop(treeData)

    return <Tree {...this.treeConfig} onSelect={this.onSelectNode} loadData={this.onLoadData} defaultSelectedKeys={defaultSelectedKeys}>
      {treeNodes}
    </Tree>
  }
}
