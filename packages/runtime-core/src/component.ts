import { hasOwn, isFunction, isObject } from '@vue/shared'
import { reactive, proxyRefs } from '@vue/reactivity'
import { ShapeFlags } from './createVNode'

export let instance = null

export const getCurrentInstance = () => instance
export const setCurrentInstance = i => (instance = i)

export function createComponentInstance(vnode, parent) {
  let instance = {
    ctx: {} as any, // 当前实例的上下文，用于存储信息的
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
    setupState: {}, // setup返回的是对象则要给这个对象赋值
    slots: {}, // 存放组件的所有插槽信息
    parent, // 标记当前组件的父亲是谁
  }

  return instance
}

function initSlots(instance, children) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = children
  } else {
    instance.slots = {}
  }
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
  $slots: i => i.slots,
}
// 做代理，代理组件实例
const instanceProxy = {
  get(target, key) {
    const { data, props, setupState } = target
    // setupState -> data -> props
    if (data && hasOwn(data, key)) {
      return data[key]
    } else if (setupState && hasOwn(setupState, key)) {
      return setupState[key]
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
    const { data, props, setupState } = target
    if (data && hasOwn(data, key)) {
      data[key] = value
    } else if (setupState && hasOwn(setupState, key)) {
      setupState[key] = value
    } else if (props && hasOwn(props, key)) {
      console.warn('props not update')
      return false
    }
    return true
  },
}

export function setupComponent(instance) {
  // type 就是用户传入的属性
  const { type, props, children } = instance.vnode
  let { data, render } = type

  initProps(instance, props)
  initSlots(instance, children) // 初始化插槽
  let { setup } = type
  if (setup) {
    // 对setup做相应处理
    const setupContext = {
      slots: instance.slots, //插槽属性
      attrs: instance.attrs, // attrs
    }
    setCurrentInstance(instance) // 在调用setup的时候保存当前实例
    // 执行setup函数，结果可能是render函数或者对象爱敬，存入setupState中去
    const setupResult = setup(instance.props, setupContext)
    setCurrentInstance(null)
    if (isFunction(setupResult)) {
      instance.render = setupResult
    } else if (isObject(setupResult)) {
      instance.setupState = proxyRefs(setupResult) // 这里对返回值进行结构
    }
  }

  instance.proxy = new Proxy(instance, instanceProxy)
  if (data) {
    if (!isFunction(data))
      return console.warn('The data option must be a function.')
    instance.data = reactive(data.call(instance.proxy))
  }

  if (!instance.render) {
    if (render) {
      instance.render = render
    } else {
      // 模板编译原理
    }
  }
}
