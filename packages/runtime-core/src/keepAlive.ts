import { onMounted, onUpdated } from './apiLifecycle'
import { getCurrentInstance } from './component'
import { ShapeFlags } from './createVNode'

function resetFlag(vnode) {
  if (vnode.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
    vnode.shapeFlag -= ShapeFlags.COMPONENT_KEPT_ALIVE
  }
  if (vnode.shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
    vnode.shapeFlag -= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
  }
}
export const KeepAlive = {
  __isKeepAlive: true, // 自定义用来标识keep-alive组件
  props: {
    max: {},
  },
  setup(props, { slots }) {
    // dom操作api都在instance.ctx.renderer上面
    const instance = getCurrentInstance()
    let { createElement, move, unmount } = instance.ctx.renderer
    const keys = new Set() // 缓存组件的key
    const cache = new Map() // 缓存组件的映射关系
    const pruneCacheEntry = vnode => {
      const subTree = cache.get(vnode)
      resetFlag(subTree) // 移除keep-alive标记
      unmount(subTree)
      cache.delete(vnode)
      keys.delete(vnode)
    }
    let storageContainer = createElement('div')

    instance.ctx.active = (n2, container, anchor) => {
      move(n2, container, anchor)
    }
    instance.ctx.deactivate = n1 => {
      // 组件卸载的时候 会将虚拟节点对应的真实节点，移动到容器中
      move(n1, storageContainer)
    }

    let pendingCacheKey = null

    const cacheSubTree = () => {
      cache.set(pendingCacheKey, instance.subTree)

      // console.log(cache)
    }
    onMounted(cacheSubTree)
    onUpdated(cacheSubTree)

    return () => {
      let vnode = slots.default()
      // 不是组件就不用缓存了
      if (!(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT)) {
        return vnode
      }
      let comp = vnode.type
      // 组件的名字  找 name，找key ，找组件本身
      // let componentName = currentComponent.name
      let key = vnode.key == null ? comp : vnode.key
      pendingCacheKey = key
      let cacheVnode = cache.get(key)
      if (cacheVnode) {
        // 走到缓存里需要干什么？
        vnode.component = cacheVnode.component // 复用组件
        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE // 组件走缓存的时候不要初始化
      } else {
        keys.add(key)
        let { max } = props
        if (max && keys.size > max) {
          // 删除第一个元素 ，在最后增加
          // next 返回的是一个对象 {value,done}
          pruneCacheEntry(keys.values().next().value)
        }
        console.log(keys.values().next());
        
        vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE // 用来告诉这个vnode稍后卸载的时候 应该缓存起来
      }
      // 组件还是会重新创建, 会走mountComponent
      return vnode
    }
  },
}
// keep-alive 中的插槽变化了 需要重新渲染，重新渲染的时候 看一下之前有没有缓存过
// c1 -> c2  -> c1

// 缓存策略 LRU算法， 最近使用的放到最后， 很久不用的放到最前面
