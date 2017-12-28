import { createStore, combineReducers, compose, applyMiddleware } from 'redux'
import ThunkMiddleware from 'redux-thunk'
import asyncPromiseMiddleware from '@sdp.nd/redux-async-promise'
import state from './state'
import reducers from './reducers'

const finalCreateStore = compose(applyMiddleware(
  ThunkMiddleware,
  ...asyncPromiseMiddleware({
    // 全局 loading action type
    globalLoadingActionType: 'base/RECEIVE_LOADING_STATE',
    // 全局提示消息 action type
    globalMessageActionType: 'base/RECEIVE_GLOBAL_MESSAGE'
  })
))(createStore)

export default function configureStore () {
  return finalCreateStore(combineReducers(reducers), state)
}
