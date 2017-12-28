import rbac from 'ae/core/rbac'

export default function (permission, scope, deco) {
  if (permission === 1) {
    return [
      rbac.prefix || rbac.client,
      // x/modules/y/modules/z -> admin_x_y_z
      scope.replace(/\/modules\//g, '_'),
      deco]
      .filter(a => !!a).join('_')
  }

  return permission
}
