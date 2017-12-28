import axios from 'axios'
import isArray from 'lodash/isArray'
import isFunction from 'lodash/isFunction'
import buildURL from 'ae/shared/build-url'
import replaceURI from 'ae/shared/replace-uri'

function getAuthorization (url, method = 'GET', headerArrays = '') {
  // 需要编码 URL 中特殊字符，比如非 ASCII 字符
  return window.JsMAF.getAuthHeader(url.replace(/'/g, '%27'), method, headerArrays)
}

function Client (request, response) {
  const _client = axios.create()

  function intercept (request, response) {
    if (request) {
      if (!isArray(request)) {
        request = [request]
      }
      _client.interceptors.request.use(...request)
    }
    if (response) {
      if (!isArray(response)) {
        response = [response]
      }
      _client.interceptors.response.use(...response)
    }
  }

  let intercepted = false

  return {
    intercept,
    request (config, iReq, iRes) {
      if (!intercepted) {
        intercepted = true
        // 延迟 intercept，以保证此处的拦截器会先执行
        intercept(request, response)
      }
      return Promise.resolve(config)
        // req 先于 axios 的 request interceptor
        .then(iReq)
        .then(_client.request)
        .then(({ data }) => data)
        // res 后于 axios 的 response interceptor
        .then((data) => {
          if (isFunction(iRes)) {
            return iRes(data, config)
          }
          return data
        })
    }
  }
}

const client = new Client([config => {
  const { url = '', uriParams, params, method, headers = {} } = config
  config.url = replaceURI(url, uriParams)
  const macToken = getAuthorization(buildURL(config.url, params), method)
  if (macToken) {
    headers.Authorization = macToken
    config.headers = headers
  }
  if (window.global_uc_sdp_app_id) {
    headers['sdp-app-id'] = window.global_uc_sdp_app_id
  }
  return config
}, error => {
  // Do something with request error
  return Promise.reject(error)
}])

function intercept (...args) {
  return client.intercept(...args)
}

export default function request (config, req, res) {
  return client.request(config, req, res)
}

export {
  Client,
  intercept,
  request
}
