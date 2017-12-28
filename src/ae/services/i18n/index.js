import { addLocaleData } from 'react-intl'
import IntlMessageFormat from 'intl-messageformat'
import moment from 'moment'
import scriptjs from 'scriptjs'
import mergeWith from 'lodash/mergeWith'
import isArray from 'lodash/isArray'
import { Client } from 'ae/shared/request'
import hasOwn from 'ae/shared/has-own'
import global from 'ae/polyfills/_global'
import LanguageDetector from './detector'
import LANGUAGE from './language.json'

const cache = {}

// 使用 client 以避免无谓的 getAuthorization
const client = new Client()

function _getTranslations (scope, language) {
  // 使用 replace，兼容 scope 为空的情况
  const req = client.request(`${AECONST.LOCALE_BASE}${scope}/${language}.json`.replace(/locale\/\/+/g, 'locale/'))
  // zh-CN...
  const arr = language.split('-')
  if (arr.length === 2) {
    // 如果不存在地区码对应的文件，
    // 则调用语言码对应的文件
    return req.catch(e => _getTranslations(scope, arr[0]))
  }
  return req.catch(e => ({}))
}

class I18N {
  language = null

  defaultOptions = {
    supportLanguages: ['zh-CN', 'en'],
    detection: {
      // order and from where user language should be detected
      order: ['querystring', 'localStorage', 'navigator'],

      // keys or params to lookup language from
      lookupQuerystring: 'locale',
      lookupLocalStorage: 'aeLocale',

      // cache user language on
      caches: ['localStorage']
    }
  }

  init (options = {}) {
    this.options = mergeWith({}, this.defaultOptions, options, (objVal, srcVal) => {
      if (isArray(objVal)) { // 数组不再合并，直接覆盖
        return srcVal
      }
    })

    const { detection, getTranslations } = this.options
    this.detector = new LanguageDetector(detection)
    this.language = this.detectLanguage()

    // 自定义翻译资源获取方法
    if (getTranslations) {
      this.getTranslations = getTranslations
    }
    // 保存到 localStorage
    this.cacheUserLanguage(this.language)
  }

  getTranslations (scope, language) {
    if (cache[scope]) {
      return cache[scope]
    }

    return (cache[scope] = _getTranslations(scope, this.getLanguage())
      .then(res => {
        cache[scope] = Promise.resolve(res)
        return res
      }))
  }

  detectLanguage () {
    const { supportLanguages } = this.options
    let detectedLanguage = this.detector.detect()

    if (detectedLanguage) {
      const lang = this.getLanguage(detectedLanguage)

      if (!supportLanguages.includes(detectedLanguage)) {
        detectedLanguage = supportLanguages.includes(lang)
          ? lang
          : supportLanguages[0]
      }
    }

    return detectedLanguage
  }

  getLanguage (language) {
    const lang = language || this.language || this.detectLanguage()
    // 除英语之外返回全称
    return /^en/img.test(lang) ? 'en' : lang
  }

  // 获取支持的语言列表
  getSupportLanguages () {
    return this.options.supportLanguages.map(id => ({
      id,
      label: LANGUAGE[id] || id
    }))
  }

  // 获取语言+地区、语言名称
  getLocale () {
    return {
      id: this.language,
      label: LANGUAGE[this.language] || this.language
    }
  }

  addLocaleData () {
    return new Promise((resolve, reject) => {
      // locale/intl 下只有语言码，因此截取
      const lang = this.language.split('-')[0]
      scriptjs(`${AECONST.CDN_JS_BASE}locale/intl/${lang}.js`, () => {
        addLocaleData(global.ReactIntlLocaleData[lang])
        resolve()
      })
    })
  }

  updateMoment () {
    // 英文无需加载
    if (this.language === 'en') {
      return
    }

    return new Promise((resolve, reject) => {
      // 储存
      const oldMoment = global.moment
      global.moment = moment

      const lang = this.language.toLowerCase()
      scriptjs(`${AECONST.CDN_JS_BASE}locale/moment/${lang}.js`, () => {
        moment.locale(this.language)
        // 回设
        global.moment = oldMoment
        resolve()
      })
    })
  }

  translate (key, values, defaultMessage, translations = {}) {
    // 支持 {'a.b.c.d': '...'} 的情况
    const res = hasOwn(translations, key)
      ? translations[key]
      // 支持 {a: {b: {c: {d: '...'}}}} 的情况
      : key.split('.').reduce((res, key) => {
        if (res && typeof res === 'object' && hasOwn(res, key)) {
          return res[key]
        }
      }, translations)

    if (res) {
      // 替换变量
      return new IntlMessageFormat(res, this.language).format(values)
    }

    return res === undefined ? defaultMessage : res
  }

  cacheUserLanguage (lng) {
    const { detection = {} } = this.options
    this.detector.cacheUserLanguage(lng, detection.caches)
  }

  isI18nObj (value) {
    return value && Object.keys(LANGUAGE).some(lang => hasOwn(value, lang))
  }

  // 规范国际化数据结构
  normalize (value) {
    return this.isI18nObj(value) ? Object.assign({}, value) : this.encode(value)
  }

  /**
   * 国际化数据编码
   * value: 'xxx'
   * =>
   * value: {
   *   'zh-CN': 'xxx',
   * }
   * @return {object} 国际化数据
   */
  encode (value) {
    const language = this.language || this.detectLanguage()

    return {
      [language]: value
    }
  }

  /**
   * 国际化数据解码
   * value: {
   *   'zh-CN': 'xxx'
   * }
   * =>
   * value: 'xxx'
   * @return {string} 'xxx'
   */
  decode (value) {
    const language = this.language || this.detectLanguage()
    if (this.isI18nObj(value)) {
      return value[language] || ''
    }

    return value
  }
}

export default new I18N()
