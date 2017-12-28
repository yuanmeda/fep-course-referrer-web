import restify from 'ae/shared/restify-actions'

export default restify(null, {
  uri: `${ORIGINS.UC}/v1.0/tokens/:access_token/actions/valid`
}, { primaryKey: ['user_id'] })
