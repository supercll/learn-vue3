// 函数的重载重载  不同的参数 决定了不同的功能
// 1) 元素 内容
// 2) 元素 属性 内容
// 3) 元素 属性 多个儿子
// 4) 元素 儿子 / 元素    (只要不是文本节点，都会把儿子转成数组)
// 5) 元素 空属性 多个儿子
// console.log(h('h1',null,h('span','hello'),h('span','hello'),h('span','hello')))

import { isArray, isObject } from '@vue/shared'
import { isVnode, createVNode } from './createVNode'

// h方法是为了让用户用的方便， 实际上底层虚拟节点的产生 type ,props,children,key
// createVNode 还有优化 后续还要做优化处理

export function h(type, propsOrChildren, children) {
  // h方法 如果参数为两个的情况  1） 元素 + 属性  2） 元素 + 儿子
  const l = arguments.length
  if (l === 2) {
    // 如果propsOrChildren是对象的话 可能是属性 可能是儿子节点
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // h(type,属性或者元素对象)
      // 要么是元素对象 要么是属性
      if (isVnode(propsOrChildren)) {
        // h(type,元素对象)
        return createVNode(type, null, [propsOrChildren])
      }
      return createVNode(type, propsOrChildren) // h(type,属性)
    } else {
      // 属性 + 儿子的情况   儿子是数组 或者 字符
      return createVNode(type, null, propsOrChildren) // h(type,[] )  h(type,'文本‘)
    }
  } else {
    if (l === 3 && isVnode(children)) {
      // h(type,属性，儿子)
      children = [children]
    } else if (l > 3) {
      children = Array.from(arguments).slice(2) // h(type,属性，儿子数组)
    }
    return createVNode(type, propsOrChildren, children)
    // l > 3
  }
}
