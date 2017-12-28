export default {
  name: 'navigator',

  lookup () {
    return navigator.language || navigator.browserLanguage
  }
}
