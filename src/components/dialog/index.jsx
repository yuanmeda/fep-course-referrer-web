/**
 * @function 自定义页脚弹窗
 * @extends  可通过Dialog.xx()快捷弹窗（xx目前支持warning，confirm，及tip）
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-21 11:26:44
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   同 http://fish-docs.dev.web.nd/components/modal-cn/
 * @example   <Dialog {...config}>内容</Dialog>
 */

import Dialog from './Dialog'
import base from './base'
import tip from './tip'

/**
 * [warning] 提示弹窗
 * @param  {[Object]} props {
 *   title:'提示',
 *   okText:'确定',
 *   onOk: fn, // 确定回调
 *   content:'',  // 提示内容
 * }
 * @return {[Object]}  {destroy: fn 手动销毁方法}
 */
Dialog.warning = props => {
  const config = Object.assign({
    title: '提示',
    okText: '确定'
  }, props)
  return base(config)
}

/**
 * [confirm] 确认弹窗
 * @param  {[Object]} props {
 *   title:'提示',
 *   okText:'确定',
 *   onOk: fn, // 确定回调
 *   cancelText:'取消',
 *   onCancel: fn, // 取消回调
 *   content:'',  // 内容
 * }
 * @return {[Object]}  {destroy: fn 手动销毁方法}
 */
Dialog.confirm = props => {
  const config = Object.assign({
    title: '提示',
    okText: '确定',
    cancelText: '取消'
  }, props)
  return base(config)
}

/**
 * [tip]
 * @param props {[string / object]}
 * props:'保存成功' or
 * props:{
 *   content:'保存成功',
 *   duration: 3000
 * }
 */
Dialog.tip = props => {
  return tip(props)
}

export default Dialog
