import { isNumber, isString } from '@vue/shared'
import { ShapeFlags, Text, createVNode, isSameVNode } from './createVNode'

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
  function patchProps(oldProps, newProps, el) {
    if (oldProps == null) oldProps = {}
    if (newProps == null) newProps = {}

    // 循环新的覆盖老的，
    for (let key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key])
    }
    // 老的有的新没有要删除
    for (let key in oldProps) {
      if (newProps[key] == null) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  function mountElement(vnode, container) {
    let { type, props, children, shapeFlag } = vnode
    // 因为我们后续需要比对虚拟节点的差异更新页面，所有需要保留对应的真实节点
    let el = (vnode.el = hostCreateElement(type))
    if (props) {
      // {a:1, b:2}  {c:3}
      // 更新属性
      patchProps(null, props, el)
    }
    // children不是数组 就是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    }
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    }
    hostInsert(el, container)
  }

  function patchKeyedChildren(c1, c2, el) {
    // 比较 c1 和 c2 两个数组之间的差异 ， 再去更新el
    // On

    // 尽可能复用节点，而且找到变化的位置   优化： 原则上的diff算法很简单就是拿新的去里面找

    // 先考虑 一些顺序相同的情况，追加，或者删除

    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    // 有任何一方比对完成后 就无需在比对了

    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      i++
    }
    console.log(i, e1, e2)

    // a b c d e   f
    // a b c d e q f
  }
  function patchChildren(n1, n2, el) {
    let c1 = n1.children
    let c2 = n2.children

    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    // 开始比较儿子的情况
    // 文本	数组	（删除老儿子，设置文本内容）
    // 文本	文本	（更新文本即可）
    // 文本	空	（更新文本即可) 与上面的类似
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1) //  文本	 数组	（删除老儿子，设置文本内容）
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2)
      }
    } else {
      // 最新的要么是空 要么是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 之前是数组
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 前后都是数组
          // diff算法       数组	数组	（diff算法）
          patchKeyedChildren(c1, c2, el)
        } else {
          // 空	数组	（删除所有儿子）
          unmountChildren(c1)
        }
      } else {
        // 数组	文本	（清空文本，进行挂载）
        // 数组	空	（进行挂载） 与上面的类似
        // 空	文本	（清空文本）
        // 空	空	（无需处理）
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 前后都是数组
          mountChildren(c2, el)
        }
      }
    }
  }
  function patchElement(n1, n2) {
    // n1 和 n2 能复用说明dom节点就不用删除了

    let el = (n2.el = n1.el) // 1) 节点复用

    let oldProps = n1.props
    let newProps = n2.props
    patchProps(oldProps, newProps, el) // 2) 比较属性

    // 3） 自己比较完毕后 比较儿子
    patchChildren(n1, n2, el)
  }
  function processText(n1, n2, container) {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateTextNode(n2.children)), container)
    }
  }
  function processElement(n1, n2, container) {
    if (n1 == null) {
      mountElement(n2, container)
    } else {
      patchElement(n1, n2)
    }
  }
  function unmount(n1) {
    hostRemove(n1.el)
  }
  function unmountChildren(children) {
    children.forEach(child => {
      unmount(child)
    })
  }
  function patch(n1, n2, container) {
    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1)
      n1 = null // 将n1 重制为null  此时会走n2的初始化
    }
    // 判断标签名 和 对应的key 如果一样 说明是同一个节点 div  key:1

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
    if (vnode == null) {
      // 卸载节点
      // 卸载元素
      if (container._vnode) {
        unmount(container._vnode)
      }
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
