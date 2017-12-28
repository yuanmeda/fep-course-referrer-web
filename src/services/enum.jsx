/**
 * @function 码表枚举
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-08 11:19:23
 * @version  v0.1 [高精尖业务v0.9.3]
 */

import request from 'ae/shared/request'

const getName = function (key, attr) {
  let matchItem
  attr = attr || 'name'
  this.forEach(item => {
    if (!matchItem && item.code === key) {
      matchItem = item
    }
  })
  return matchItem ? matchItem[attr] : key
}

/**
 * [description 异步获取码表数据，axios暂不支持同步]
 * @param  {[type]} codeType [码表类型，参见http://wiki.sdp.nd/index.php?title=%E9%AB%98%E7%B2%BE%E5%B0%96-%E7%A0%81%E8%A1%A8]
 * @return {[type]}          [{code:'',name:''},...]
 */
const codeCache = {}
const getCodes = (codeType, url = `${ORIGINS.FEP}/v1/common/get_codes`) => {
  const cacheKey = `${codeType}_${url}`
  if (codeCache[cacheKey]) {
    return Promise.resolve(codeCache[cacheKey])
  }
  const config = {
    method: 'get',
    url,
    params: { code_type: codeType }
  }
  return request(config).then(resData => {
    let items
    resData.forEach(data => {
      if (!items && data.code_type === codeType) {
        items = data.items
      }
    })
    items.getName = getName
    codeCache[cacheKey] = items
    return items
  })
}

// 学科码表，请求头带有sdp-app-id后端会据此返回高精尖或NDR码表
const courseEnum = () => {
  return getCodes('course')
}

const tenantCourseEnum = tenantId => {
  const url = `${ORIGINS.FEP}/v1/admins/tenants/${tenantId}/get_codes`
  return getCodes('course', url)
}

/**
 * [subjectEnum 选考科目码表。如BI_CH:'生化']
 * @params (version, isCurrent)
 * version: 选科配置科目版本号，is_current:false时有效，传空则默认为最新版本
 * isCurrent: 是否获取当前学科统计的选考科目，即固化后学科数据
 * @return [{code, name},...,getName]
 */
const subjectCache = {}
const subjectEnum = (version, isCurrent) => {
  if (!isCurrent && version && subjectCache[version]) {
    return Promise.resolve(subjectCache[version])
  }
  const config = {
    url: `${ORIGINS.FEP}/v1/tenant_admins/tenants/referral_subject`,
    method: 'get',
    params: {
      version: version,
      isCurrent: isCurrent
    }
  }
  return request(config).then(resData => {
    const items = resData.referral_subjects.map(item => {
      return {
        code: item.subject_id,
        name: item.subject_name,
        icon: item.icon
      }
    })
    items.getName = getName
    subjectCache[version] = items
    return items
  })
}

/**
 * [subjectCombineEnum 选考组合科目码表]
 * @params (version, isCurrent)
 * version: 选科配置科目版本号，is_current:false时有效，传空则默认为最新版本
 * isCurrent: 是否获取当前学科统计的选考科目，即固化后学科数据
 * @return [{code: [subject_id, subject_id], name:[subject_name,subject_name]},...,getName]
 */
const subjectCombineCache = {}
const subjectCombineEnum = (version, isCurrent) => {
  if (!isCurrent && version && subjectCombineCache[version]) {
    return Promise.resolve(subjectCombineCache[version])
  }
  const config = {
    url: `${ORIGINS.FEP}/v1/tenant_admins/tenants/referral_subject`,
    method: 'get',
    params: {
      version: version,
      isCurrent: isCurrent
    }
  }
  return request(config).then(resData => {
    const subjectList = resData.referral_subjects.map(item => {
      return {
        code: item.subject_id,
        name: item.subject_name
      }
    })
    subjectList.getName = getName

    const items = resData.subject_combine.map(itemArr => {
      return {
        code: itemArr,
        name: itemArr.map(item => {
          return subjectList.getName(item)
        })
      }
    })
    items.getName = getName
    subjectCombineCache[version] = items
    return items
  })
}

// 年级码表
const gradeEnum = codeType => {
  return getCodes('grade')
}

// 区域类型码表
const areaRangeEnum = () => {
  const codes = ['class', 'grade', 'school', 'school_district', 'area', 'city']
  const names = ['班级', '年级', '学校', '学区', '区县', '市']
  const dataEnum = codes.map((code, index) => {
    return {
      code: code,
      name: names[index]
    }
  })
  dataEnum.getName = getName
  return Promise.resolve(dataEnum)
}

// 吻合度码表
const fitnessEnum = () => {
  const codes = ['fully', 'basically', 'inconformity']
  const names = ['完全符合', '基本符合', '不符合']
  const dataEnum = codes.map((code, index) => {
    return {
      code: code,
      name: names[index]
    }
  })
  dataEnum.getName = getName
  return Promise.resolve(dataEnum)
}

export default {
  courseEnum,
  subjectEnum,
  gradeEnum,
  areaRangeEnum,
  fitnessEnum,
  subjectCombineEnum,
  tenantCourseEnum
}
