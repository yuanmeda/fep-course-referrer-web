import hasOwn from 'ae/shared/has-own'

export default function (name, path, permission, menu = {}) {
  if (name) {
    if (!hasOwn(menu, 'title')) {
      menu.title = name
    }
  }

  menu.permission = permission
  menu.path = path

  return menu
}
