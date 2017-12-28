import buildURL from 'axios/lib/helpers/buildURL'

export default function (url, params, paramsSerializer, encode = encodeURI) {
  return buildURL(encode(url), params, paramsSerializer)
}
