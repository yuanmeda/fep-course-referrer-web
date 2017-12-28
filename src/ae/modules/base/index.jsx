export default scope => ({
  // namespaced: true,
  state: {
    globalLoading: false,
    globalMessage: null
  },
  reducers: {
    'RECEIVE_LOADING_STATE': {
      next (state, action) {
        return {
          ...state,
          globalLoading: action.payload
        }
      }
    },
    'RECEIVE_GLOBAL_MESSAGE': {
      next (state, action) {
        const { payload } = action.payload
        let globalMessage = {}

        if (payload instanceof Error) {
          globalMessage = payload
        } else {
          // 查找类型为 Error 的字段
          Object.values(payload).some(value => {
            if (value instanceof Error) {
              globalMessage = value
              return true
            }
            return false
          })
        }

        return {
          ...state,
          globalMessage
        }
      }
    }
  }
})
