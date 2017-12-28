/**
 * @function 租户管理员module接口
 * @authors  130061@nd
 * @date     2017-12-13
 * @version  v0.1 [高精尖业务v0.9.3]
 */

import request from 'ae/shared/request'

/**
 * @function [GET] /tenants/{tenant_id}/referral_subject_config 获取选科配置
 * @param  param
 * tenant_id:租户id。
 * @returns
 *
 {
     // 选考科目
     "referral_subjects":[{                      // 选考科目
         "subject":"string",                     // 选考科目id(学科的编码组合，比如语文编码_数学编码，学科编码详见码表)
         "name":"string",                        // 选考科目名称
         "icon":"string",                        // 选考科目icon
         "scales":[{
             "course":"string",                  // 学科代码,详见码表
             "scale":double                      // 学科指数比例
         },...]
     },...]

     // 选考规则
     "referral_rule":{
         "referral_subject_num":int,             // 需选考科目数
         "required_subjects":[{                  // 必选科目集合
             "subjects":[string,...],            // 必选科目范围(学科的编码组合，比如语文编码_数学编码，学科编码详见码表)
             "num":int                           // 必选科目数
         },...]
     }

     // 计分规则
     "scoring_rule":[double,double,...]          // [第一高,第二高,...]
 }
 */
const getReferralSubjectConfig = param => {
  const config = {
    method: 'get',
    url: `${ORIGINS.FEP}/v1/admins/tenants/${param.tenant_id}/referral_subject_config`
  }
  return request(config)
}
/**
 * @function [PUT] /tenants/{tenant_id}/referral_subject_config/referral_rule 选科配置-设置选考规则
 * @param param
 * tenant_id:必须,租户id
 *
 {
     "referral_subject_num":int,             // 需选考科目数
     "required_subjects":[{                  // 必选科目集合
         "subjects":[string,...],            // 必选科目范围(学科的编码组合，比如语文编码_数学编码，学科编码详见码表)
         "num":int                           // 必选科目数
     },...]
 }
 * @returns {Promise.<boolean>}
 */
const setReferralRule = param => {
  return request({
    url: `${ORIGINS.FEP}/v1/admins/tenants/${param.tenant_id}/referral_subject_config/referral_rule`,
    method: 'put',
    data: param.data
  })
}
/**
 * @description [PUT] /admins/tenants/{tenant_id}/referral_subject_config/scoring_rule 选科配置-设置计分规则
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param       {[String]} tenant_id:必须,租户id  body: [double,double,...]
 * @return      {[Array]}  [double,double,...]
 */
const setScoringRule = param => {
  return request({
    url: `${ORIGINS.FEP}/v1/admins/tenants/${param.tenant_id}/referral_subject_config/scoring_rule`,
    method: 'put',
    data: param.data
  })
}
/**
 * @description [PUT] /admins/tenants/{tenant_id}/referral_subject_config/referral_subject 选科配置-设置选考科目
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param       {[String]} tenant_id:必须,租户id
 *
  {
      "referral_subjects":[{              // 选考科目
          "subject_name":"string",        // 选考科目名称
          "icon":"string",                // 选考科目icon
          "scales":[{
              "course":"string",          // 学科代码,详见码表
              "scale":double              // 学科指数比例
          },...]
      },...]
  }
 * @return      {[Object]}
 *  {
      "referral_subjects":[{              // 选考科目
          "subject_name":"string",        // 选考科目名称
          "icon":"string",                // 选考科目icon
          "scales":[{
              "course":"string",          // 学科代码,详见码表
              "scale":double              // 学科指数比例
          },...]
      },...]
  }
 */
const setReferralSubject = param => {
  return request({
    url: `${ORIGINS.FEP}/v1/admins/tenants/${param.tenant_id}/referral_subject_config/referral_subject`,
    method: 'put',
    data: param.data
  })
}
/**
 * @description [GET] /tenant_admins/tenants/algorithm_config
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param       course:必须,学科编码,比如$SB0100
 * @return
 *
    {
        // 学科推荐指数
        "referral_param":{
            "k1":double,
            "k2":double,
            "k3":double,
            "rgq":"double",
            "rgn":"double"
        },
        // 综合成绩
        "composition_param":{
            "w1":double,
            "w2":double
        },
        // 线下成绩
        "offline_param":{
            "three_terms":{
                "w1":double,
                "w2":double,
                "w3":double
            },
            "two_terms":{
                "w1":double,
                "w2":double
            }
        },
        // 线上成绩
        "online_param":{
            "three_terms":{
                "w1":double,
                "w2":double,
                "w3":double
            },
            "two_terms":{
                "w1":double,
                "w2":double
            }
        }
    }
 */
const getAlgorithmConfig = param => {
  return request({
    url: `${ORIGINS.FEP}/v1/tenant_admins/tenants/algorithm_config`,
    method: 'get',
    params: {
      course: param.course
    }
  })
}
/**
 * @description [PUT] /tenant_admins/tenants/algorithm_config 设置算法配置
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param       course:必须,学科编码,比如$SB0100
 * {
    // 学科推荐指数
    "referral_param":{
        "k1":double,
        "k2":double,
        "k3":double,
        "rgq":"double",
        "rgn":"double"
    },
    // 综合成绩
    "composition_param":{
        "w1":double,
        "w2":double
    },
    // 线下成绩
    "offline_param":{
        "three_terms":{
            "w1":double,
            "w2":double,
            "w3":double
        },
        "two_terms":{
            "w1":double,
            "w2":double
        }
    },
    // 线上成绩
    "online_param":{
        "three_terms":{
            "w1":double,
            "w2":double,
            "w3":double
        },
        "two_terms":{
            "w1":double,
            "w2":double
        }
    }
}
 * @return      {[type]}
 */
const setAlgorithmConfig = param => {
  return request({
    url: `${ORIGINS.FEP}/v1/tenant_admins/tenants/algorithm_config`,
    method: 'put',
    params: {course: param.course},
    data: param.data
  })
}
/**
 * @description [GET] /admins/tenants/{tenant_id}/org_tree/import/status 组织树初始数据是否有导入过
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param       tenant_id,必须，租户id
 * @return
 *
  {
      status:boolean  //是否导入过:true导入过,false:未导入过
  }
 */
const getOrgTreeStatus = param => {
  return request({
    url: `${ORIGINS.FEP}/v1/admins/tenants/${param.tenant_id}/org_tree/import/status`,
    method: 'get'
  })
}
/**
 * @description [GET] /admins/tenants/{tenant_id}/students/import/status 学生信息初始数据是否有导入过
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param       tenant_id,必须，租户id
 * @return
 * {
    status:boolean  //是否导入过:true导入过,false:未导入过
  }
 */
const getStudentsStatus = param => {
  return request({
    url: `${ORIGINS.FEP}/v1/admins/tenants/${param.tenant_id}/students/import/status`,
    method: 'get'
  })
}
/**
 * @description [GET] /admins/tenants/{tenant_id} 获取租户
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param       tenant_id,必须，租户id
 * @return
 *
  {
      "tenant_name":"string",             //租户名称
      "tenant_type":"string",             //租户类型(项目信息配置),教育平台:esp,高精尖:fep
      "uc":{                              //UC信息配置
          "org_id":long,              //组织ID
          "org_code":"string"             //组织code
      },
      "tenant_project":{                  //教育平台信息配置
          "project_id":long,          //项目ID
          "project_code":"string"         //项目code
      },
      "sdp_app_id":"string"               //sdp_app_id
  }
 */
const getTenants = param => {
  return request({
    url: `${ORIGINS.FEP}/v1/admins/tenants/${param.tenant_id}`,
    method: 'get'
  })
}
/**
 * @description [GET] /tenant_admins/tenants/course 获取租户学科
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param
 * @return
 *
  {
      // 学科
      "courses":[{
          "course":"string",                      // 学科编码,详见码表
          "name":"string"                         // 学科名称,比如语文
      },...]
  }
 */
const getTenantCourse = param => {
  return request({
    url: `${ORIGINS.FEP}/v1/tenant_admins/tenants/course`,
    method: 'get'
  })
}
/**
 * @description [POST] /admins/tenants 新增租户
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param
 *
  {
      "tenant_name":"string",             //租户名称
      "tenant_type":"string",             //租户类型(项目信息配置),教育平台:esp,高精尖:fep
      "tenant_project":{                  //教育平台信息配置
          "project_id":long,              //项目ID
          "project_code":"string"         //项目code
      },
      "sdp_app_id":"string"               //sdp_app_id
  }
 * @return
  {
      "tenant_id":"string"                //租户id
  }
 */
const addTenants = param => {
  return request({
    url: `${ORIGINS.FEP}/v1/admins/tenants`,
    method: 'post',
    data: param
  })
}
/**
 * @description [PUT] /admins/tenants/{tenant_id} 修改租户
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param       tenant_id,必须，租户id
 *
  {
      "tenant_name":"string",             //租户名称
  }
 * @return
 */
const editTenants = param => {
  return request({
    url: `${ORIGINS.FEP}/v1/admins/tenants/${param.tenant_id}`,
    method: 'put',
    data: param.data
  })
}

export default {
  getReferralSubjectConfig,
  setReferralSubject,
  setReferralRule,
  setScoringRule,
  getAlgorithmConfig,
  setAlgorithmConfig,
  getOrgTreeStatus,
  getStudentsStatus,
  getTenantCourse,
  getTenants,
  addTenants,
  editTenants
}
