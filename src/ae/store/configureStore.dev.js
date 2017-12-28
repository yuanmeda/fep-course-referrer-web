import { createStore, combineReducers, compose, applyMiddleware } from 'redux'
import ThunkMiddleware from 'redux-thunk'
import logger from 'redux-logger'
import asyncPromiseMiddleware from '@sdp.nd/redux-async-promise'
import state from './state'
import reducers from './reducers'

let composeEnhancer = compose

const middlewares = [ThunkMiddleware, ...asyncPromiseMiddleware({
  // 全局 loading action type
  globalLoadingActionType: 'base/RECEIVE_LOADING_STATE',
  // 全局提示消息 action type
  globalMessageActionType: 'base/RECEIVE_GLOBAL_MESSAGE'
})]

const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__

if (typeof composeWithDevToolsExtension === 'function') {
  composeEnhancer = composeWithDevToolsExtension
} else {
  middlewares.push(logger)
}

const finalCreateStore = composeEnhancer(applyMiddleware(...middlewares))(createStore)

export default function configureStore () {
  return finalCreateStore(combineReducers(reducers), state)
}
