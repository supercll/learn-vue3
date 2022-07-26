import { isArray, isObject, isString } from '@vue/shared'

export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')
export function isVnode(val) {
  return !!val.__v_isVNode
}

export function isSameVNode(v1, v2) {
  return v1.type === v2.type && v1.key == v2.key
}

export function createVNode(type, props = null, children = null) {
  // 后续判断有不同类型的虚拟节点
  let shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0 // 标记出来了自己是什么类型
  // 我要将当前的虚拟节点 和 自己儿子的虚拟节点映射起来  权限组合 位运算
  const vnode = {
    // vnode 要对应真实际的节点
    __v_isVNode: true,
    type,
    props,
    children,
    key: props && props.key,
    el: null,
    shapeFlag,
    // 打个标记
  }
  if (children) {
    let temp = 0
    if (isArray(children)) {
      // 走到createVnode 要么是数组要么是字符串 h()中会对children做处理
      temp = ShapeFlags.ARRAY_CHILDREN
    } else {
      children = String(children)
      temp = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag = vnode.shapeFlag | temp
  }
  // shapeFlags  我想知到这个虚拟节点的儿子是数组 还是元素 还是文本
  return vnode
}

export const enum ShapeFlags { // vue3提供的形状标识
  ELEMENT = 1, // 1
  FUNCTIONAL_COMPONENT = 1 << 1, // 2
  STATEFUL_COMPONENT = 1 << 2, // 4
  TEXT_CHILDREN = 1 << 3, // 8
  ARRAY_CHILDREN = 1 << 4, // 16
  SLOTS_CHILDREN = 1 << 5, // 32
  TELEPORT = 1 << 6, // 64
  SUSPENSE = 1 << 7, // 128
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}

// 这种方式可以做权限的组合
// flag = element  ｜  TEXT_CHILDREN
// 0000000001
// 0000001000
//       1001    -> 9

// flag & ARRAY_CHILDREN
// 0000010000
// 0000001001
// 0000000000 > 0 说明包含这个类型

// 0000000001  -》 1 * 2^0 = 1
// 0000000010 ->  1 * 2^1 = 2
// 0000000100 ->  1 * 2^2 = 4
// 0000000111 ->  1* 2 ^ 2 + 1*2 ^1 + 1*2^0
