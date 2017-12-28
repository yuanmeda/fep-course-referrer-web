import AEDecorator from 'ae/components/Decorator'
import hasOwn from 'ae/shared/has-own'

/**
 * 专为 Form 而生……（现在 Grid 也用了 @2017.12.12）
 */
export default function config (WrappedComponent) {
  return class AEComponentDecoratorConfig extends AEDecorator {
    static defaultConfig = {
      disabled: false
    }

    initialize () {
      // 如果 config 里存在 buttons，则 push 到全局
      const { buttons } = this.config
      if (buttons) {
        // buttons 移除，避免往下传
        delete this.config.buttons
        this.pushButton(buttons)
      }
    }

    componentWillMount () {
      const { onLoad } = this.config
      if (hasOwn(this.props, onLoad)) {
        this.props[onLoad]()
      }
    }

    // @override
    hookRender () {
      const { config } = this
      // 默认将 config 往下传，可能模式的主体组件会需要
      return super.hookRender({ config })
    }

    // @override
    decoRender () {
      // 因为这个地址不会被激活，所以不会执行到这里
      // 此装饰器不存在 deco 的情况
    }
  }
}
