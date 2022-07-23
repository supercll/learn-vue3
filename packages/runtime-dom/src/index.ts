import { createRenderer } from '@vue/runtime-core'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const renderOptions = { patchProp, ...nodeOps }

// vue内置的渲染器，我们也可以通过createRenderer 创建一个渲染器，自己决定渲染方式
export function render(vnode, container) {
  let { render } = createRenderer(renderOptions)
  return render(vnode, container)
}
export * from '@vue/runtime-core'
