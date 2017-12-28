import manager from 'ae/core/manager'

export default function normalizeComponent (component, componentConfig) {
  return manager.getComponent(component, componentConfig)
}
