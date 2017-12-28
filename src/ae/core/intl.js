import React from 'react'
import { IntlProvider, injectIntl } from 'react-intl'
import AEComponentBase from 'ae/components/Base'
import i18n from 'ae/services/i18n'

export function moduleIntl (config) {
  return WrappedComponent => {
    // 注入 props.intl -> props.aeInjectedIntl
    WrappedComponent = injectIntl(WrappedComponent, {
      intlPropName: 'aeInjectedIntl'
    })
    return class ModuleIntl extends AEComponentBase {
      constructor (props, context) {
        super(props, context)

        this.state = {
          translations: null
        }
      }

      componentWillMount () {
        i18n.getTranslations(config.key)
          .then(translations => this.setState({ translations }))
      }

      render () {
        const { translations } = this.state
        return (
          translations ? <IntlProvider
            locale={i18n.getLanguage()}
            messages={translations}>
            <WrappedComponent {...this.props} />
          </IntlProvider> : null
        )
      }
    }
  }
}

export function componentIntl (comp, { withRef } = {}) {
  return WrappedComponent => {
    // 注入 props.intl -> props.aeInjectedIntl
    const InjectedComponent = injectIntl(WrappedComponent, {
      intlPropName: 'aeInjectedIntl',
      withRef
    })
    // TODO 没有必要继承自 AEComponentBase？
    return class ComponentIntl extends AEComponentBase {
      // 保存引用，用于权限判断
      static WrappedComponent = WrappedComponent.WrappedComponent

      getWrappedInstance () {
        if (!withRef) {
          throw new Error(`To access the wrapped instance, you need to specify
            { withRef = true } as the second argument of the componentIntl() call.`)
        }

        return this.refs.intlInstance.getWrappedInstance()
      }

      render () {
        return <InjectedComponent
          {...this.props}
          ref={withRef ? 'intlInstance' : null}
          aeComponentIntl={comp} />
      }
    }
  }
}
