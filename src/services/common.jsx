/**
 * @function 通用api
 * @authors  130061@nd
 * @date     2017-12-13
 * @version  v0.1 [高精尖业务v0.9.3]
 */

import request from 'ae/shared/request'

/**
 * @function [GET] /commonapi/get_upload_url 通用api-获取上传地址
 * @param  param
 * category:非必须，若为空则存储在项目的common目录。
 * @returns
 * {
  'access_url': 'http://cs.101.com/v0.1/upload', //上传地址
  'session_id': 'sessionid', //上传session
  'dist_path':'/edu/fep/common' //文件路径
  }
 */
const getUploadUrl = param => {
  return request({
    url: `${ORIGINS.FEP}/v1/common/get_upload_url`,
    method: 'get',
    params: param
  })
}

export default {
  getUploadUrl
}
