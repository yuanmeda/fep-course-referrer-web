const ORIGINS = require(`./origins/${process.env.SDP_ENV}`)
window.ORIGINS = Object.assign({}, ORIGINS, window.ORIGINS)

const AECONST = require(`./${process.env.SDP_ENV}`)
window.AECONST = Object.assign({}, AECONST, window.AECONST)
