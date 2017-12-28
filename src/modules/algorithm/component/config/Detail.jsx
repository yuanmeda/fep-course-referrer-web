/**
 * @description 中考选科组件：算法设置-详情
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1 [高精尖业务 v0.9.3]
 * @param {
 * configDetail: [Object] 详情数据
 * changeState：[Function] 切换状态
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Button} from 'fish'

@componentIntl('AlgorithmDetail')
export default class AlgorithmDetail extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      configDetail: props.configDetail
    }
  }
  // 参数变更 已加载组件收到新的参数时调用
  componentWillReceiveProps (props) {
    if (props.configDetail) {
      this.setState({
        configDetail: props.configDetail
      })
    }
  }
  render () {
    const {configDetail} = this.state
    return (
      <div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>学科推荐指数：RI<sub>X</sub>= K<sub>1</sub> G<sub>1</sub> + K<sub>2</sub> r<sub>GQ</sub> Q<sub>X</sub> + K<sub>3</sub> r<sub>GN</sub> N<sub>XX</sub></div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__setcol slp-mod-seniorexam__setcol2'>
              <span className='slp-mod-seniorexam__setlabel slp-mod-seniorexam__setlabel2'>参数设置：</span>
              <span className='slp-mod-seniorexam__setres'>K1 = {configDetail && configDetail.referral_param.k1} ；</span>
              <span className='slp-mod-seniorexam__setres'>K2 = {configDetail && configDetail.referral_param.k2} ; </span>
              <span className='slp-mod-seniorexam__setres'>K3 = {configDetail && configDetail.referral_param.k3} ; </span>
              <span className='slp-mod-seniorexam__setres'>r<sub>GQ</sub> = {configDetail && configDetail.referral_param.rgq} ; </span>
              <span className='slp-mod-seniorexam__setres'>r<sub>GN</sub> = {configDetail && configDetail.referral_param.rgn} ; </span>
            </div>
          </div>
        </div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>综 合 成 绩：G<sub>X</sub> = 0.6 * G<sub>C</sub> + 0.4 * G<sub>1</sub></div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__setcol slp-mod-seniorexam__setcol2'>
              <span className='slp-mod-seniorexam__setlabel slp-mod-seniorexam__setlabel2'>参数设置：</span>
              <span className='slp-mod-seniorexam__setres'>W1 = {configDetail && configDetail.composition_param.w1};</span>
              <span className='slp-mod-seniorexam__setres'>W2 = {configDetail && configDetail.composition_param.w2};</span>
            </div>
          </div>
        </div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>线 下 成 绩：G<sub>C</sub>=( g<sub>1</sub> * ω<sub>1</sub> + g<sub>2</sub> + g<sub>3</sub> * ω<sub>1</sub> ) / 10</div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__setcol slp-mod-seniorexam__setcol2'>
              <span className='slp-mod-seniorexam__setlabel slp-mod-seniorexam__setlabel2'>参数设置：</span>
              <span className='slp-mod-seniorexam__setres'>W1 = {configDetail && configDetail.offline_param.three_terms.w1};</span>
              <span className='slp-mod-seniorexam__setres'>W2 = {configDetail && configDetail.offline_param.three_terms.w2};</span>
              <span className='slp-mod-seniorexam__setres'>W3 = {configDetail && configDetail.offline_param.three_terms.w3} （ 三项成绩 ）;</span>
              <span className='slp-mod-seniorexam__setres'>W1 = {configDetail && configDetail.offline_param.two_terms.w1};</span>
              <span className='slp-mod-seniorexam__setres'>W2 = {configDetail && configDetail.offline_param.two_terms.w2}（两项成绩） ;</span>
            </div>
          </div>
        </div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>总 测 成 绩：G<sub>C</sub>=( g<sub>1</sub> * ω<sub>1</sub> + g<sub>2</sub> + g<sub>3</sub> * ω<sub>1</sub> ) / 10</div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__setcol slp-mod-seniorexam__setcol2'>
              <span className='slp-mod-seniorexam__setlabel slp-mod-seniorexam__setlabel2'>参数设置：</span>
              <span className='slp-mod-seniorexam__setres'>W1 = {configDetail && configDetail.online_param.three_terms.w1};</span>
              <span className='slp-mod-seniorexam__setres'>W2 = {configDetail && configDetail.online_param.three_terms.w2};</span>
              <span className='slp-mod-seniorexam__setres'>W3 = {configDetail && configDetail.online_param.three_terms.w3} （三项成绩 ） ;</span>
              <span className='slp-mod-seniorexam__setres'>W1 = {configDetail && configDetail.online_param.two_terms.w1};</span>
              <span className='slp-mod-seniorexam__setres'>W2 = {configDetail && configDetail.online_param.two_terms.w2}（两项成绩） ;</span>
            </div>
          </div>
        </div>
        <div className='slp-mod-seniorexam__btns'>
          <Button type='primary' onClick={() => { this.props.changeState('undetail', 'currentState') }}>修改</Button>
        </div>
      </div>
    )
  }
}
