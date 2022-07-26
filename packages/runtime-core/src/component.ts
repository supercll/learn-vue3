import { isFunction } from '@vue/shared'
import { reactive } from '@vue/reactivity'

export function createComponentInstance(vnode) {
  let instance = {
    data: null, // 组件本身的数据
    vnode, // 标识实例对应的虚拟节点
    subTree: null, // 组件对应的渲染的虚拟节点
    isMounted: false, // 组件是否挂载过
    update: null, // 组件的effect.run方法
    render: null,

    // vnode.props 组件创建虚拟节点的时候提供的
    // vnode.type.props 这个是用户写的

    propsOptions: vnode.type.props || {},
    props: {}, // 这个props 代表用户接收的属性
    attrs: {}, // 这个代表的是 没有接受

    proxy: null, // 代理对象
  }

  return instance
}
export function setupComponent(instance) {
  // type 就是用户传入的属性
  let { type, props, children } = instance.vnode
  let { data, render } = type

  if (data) {
    if (!isFunction(data)) {
      return console.warn('The data option must be a function.')
    }
    // 给实例赋予data属性
    instance.data = reactive(data.call({}))
  }

  instance.render = render
}
