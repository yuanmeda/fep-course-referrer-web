/**
 * Borrow from i18next
 * @see https://github.com/i18next/i18next-browser-languageDetector
 */

import querystring from './lookups/querystring'
import localStorage from './lookups/localStorage'
import navigator from './lookups/navigator'

export default class LanguageDetector {
  constructor (options = {}) {
    this.options = options
    this.detectors = {}

    this.addDetector(querystring)
    this.addDetector(localStorage)
    this.addDetector(navigator)
  }

  addDetector (detector) {
    this.detectors[detector.name] = detector
  }

  detect (detectionOrder) {
    if (!detectionOrder) detectionOrder = this.options.order

    let found

    detectionOrder.some(detectorName => {
      found = this.detectors[detectorName].lookup(this.options)
      return found
    })

    return found
  }

  cacheUserLanguage (lng, caches) {
    if (!caches) caches = this.options.caches
    if (!caches) return
    caches.forEach(cacheName => {
      this.detectors[cacheName] && this.detectors[cacheName].cacheUserLanguage(lng, this.options)
    })
  }
}
