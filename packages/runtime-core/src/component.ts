import { hasOwn, isFunction } from '@vue/shared'
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

function initProps(instance, rawProps) {
  const props = {}
  const attrs = {}

  const options = instance.propsOptions

  if (rawProps) {
    for (let key in rawProps) {
      const value = rawProps[key] // 拿到对应的值

      // 这里应该校验值的类型 是否符合 要求的校验
      if (key in options) {
        props[key] = value
      } else {
        attrs[key] = value
      }
    }
  }
  //  稍后更新props 应该 可以达到重新渲染的效果
  instance.props = reactive(props) // 实际上源码内部用的是浅的响应式shallowReactive
  instance.attrs = attrs // 默认是非响应式的
}
const publicProperties = {
  $attrs: instance => instance.attrs,
}
// 做代理，代理组件实例
const instanceProxy = {
  get(target, key) {
    const { data, props } = target
    if (data && hasOwn(data, key)) {
      return data[key]
    } else if (props && hasOwn(props, key)) {
      // if(hasOwn(data,key)){}
      return props[key]
    }
    let getter = publicProperties[key]
    if (getter) {
      return getter(target)
    }
  },
  set(target, key, value, receiver) {
    const { data, props } = target
    if (data && hasOwn(data, key)) {
      data[key] = value
    } else if (props && hasOwn(props, key)) {
      console.warn('props not update')
      return false
    }
    return true
  },
}
export function setupComponent(instance) {
  // type 就是用户传入的属性
  let { type, props, children } = instance.vnode
  let { data, render } = type

  initProps(instance, props)
  instance.proxy = new Proxy(instance, instanceProxy)
  if (data) {
    if (!isFunction(data)) {
      return console.warn('The data option must be a function.')
    }
    // 给实例赋予data属性
    instance.data = reactive(data.call({}))
  }

  instance.render = render
}
