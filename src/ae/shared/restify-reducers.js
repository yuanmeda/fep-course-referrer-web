export default function rest (model, source, schema) {
  function handleDelete (state, payload) {
    if (model === 'Grid') {
      const { total, result, entities } = state
      const id = payload.result[0]
      const _result = result.filter(v => v !== id)
      let matched
      const _entities = Object.entries(entities).reduce((obj, [key, value]) => {
        if (id === key) {
          matched = true
          return obj
        }
        return Object.assign(obj, {
          [key]: value
        })
      }, {})
      return {
        total: matched ? total - 1 : total,
        result: _result,
        entities: _entities
      }
    }
    return payload
  }

  function handleUpdate (state, payload) {
    if (model === 'Grid') {
      const { total, result, entities } = state
      return {
        total,
        result,
        entities: { ...entities, ...payload.entities }
      }
    } else {
      return payload
    }
  }

  function createRest (method) {
    return {
      next (state, { payload }) {
        if (method === 'list') {
          return {
            ...state,
            ...payload
          }
        }
        if (method === 'delete') {
          return handleDelete(state, payload)
        }
        return handleUpdate(state, payload)
      },
      throw (state, action) {
        return state
      }
    }
  }

  const reducers = {
    get: createRest('get'),
    put: createRest('put'),
    patch: createRest('patch'),
    delete: createRest('delete'),
    post: createRest('post')
  }

  if (model === 'Grid') {
    reducers.list = createRest('list')
  }

  return reducers
}
