import camelCase from 'redux-actions/es/camelCase'
export default val => val ? camelCase(val.replace(/\/+/g, '-')) : ''
