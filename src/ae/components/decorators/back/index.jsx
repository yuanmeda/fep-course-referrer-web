import AEDecorator from 'ae/components/Decorator'

export default function back (WrappedComponent) {
  return class AEComponentDecoratorBack extends AEDecorator {
    static defaultConfig = {
      label: '返回',
      disabled: false
    }

    initialize () {
      const { label } = this.config
      this.pushButton({
        scope: 'list',
        index: -1,
        action: () => {
          // 与浏览器返回按钮保持一致
          this.context.router.goBack()
        },
        label
      })
    }

    // @override
    // hookRender () {
    //   return super.hookRender()
    // }
  }
}
