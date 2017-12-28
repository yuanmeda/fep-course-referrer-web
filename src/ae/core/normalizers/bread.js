import hasOwn from 'ae/shared/has-own'

export default function (name, bread, menu) {
  if (!bread) {
    if (menu.title || menu.icon) {
      return menu
    }
  }
  if (name) {
    if (!hasOwn(bread, 'title')) {
      bread.title = name
    }
  }

  return bread
}
