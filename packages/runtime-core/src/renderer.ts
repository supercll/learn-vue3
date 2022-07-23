import { isNumber, isString } from '@vue/shared'
import { ShapeFlags, Text, createVNode } from './createVNode'

export function createRenderer(options) {
  // 用户可以调用此方法传入对应的渲染选项
  let {
    createElement: hostCreateElement,
    createTextNode: hostCreateTextNode,
    insert: hostInsert,
    remove: hostRemove,
    querySelector: hostQuerySelector,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setText: hostSetText,
    setElementText: hostSetElementText,
    patchProp: hostPatchProp,
  } = options
  // options 就是用户自己 渲染的时候可以决定有哪些方法

  function normalize(children, i) {
    if (isString(children[i]) || isNumber(children[i])) {
      // 给文本加标识 不能直接给字符串+ ， 得给对象+
      children[i] = createVNode(Text, null, children[i]) // 需要换掉以前存的内容
    }
    return children[i]
  }

  function mountChildren(children, container) {
    for (let i = 0; i < children.length; i++) {
      // 这样处理不行，处理后不会改变children的内容
      let child = normalize(children, i)
      // child 可能是文本内容，我们需要把文本也变成虚拟节点
      // child 可能就是文本了
      patch(null, child, container) // 递归渲染子节点
    }
  }
  function mountElement(vnode, container) {
    let { type, props, children, shapeFlag } = vnode
    // 因为我们后续需要比对虚拟节点的差异更新页面，所有需要保留对应的真实节点
    let el = (vnode.el = hostCreateElement(type))

    // children不是数组 就是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    }
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    }
    hostInsert(el, container)
  }

  function processText(n1, n2, container) {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateTextNode(n2.children)), container)
    }
  }
  function processElement(n1, n2, container) {
    if (n1 == null) {
      mountElement(n2, container)
    }
  }
  function patch(n1, n2, container) {
    // 看n1 如果是null 说明没有之前的虚拟节点
    // 看n1 如果有值 说明要走diff算法

    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // xx | TEXT_Children  xx | ARRAY_children
          processElement(n1, n2, container)
        }
    }
  }
  function render(vnode, container) {
    // 我们需要将vnode渲染到container中，并且调用options中的api
    // console.log(vnode,container)
    if (vnode == null) {
      // 卸载元素
    } else {
      // 更新
      patch(container._vnode || null, vnode, container)
    }

    container._vnode = vnode // 第一次渲染的时候我们就将这个vnode保留到了容器上
  }
  return {
    render,
  }
}
