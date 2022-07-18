import { track, trigger } from './effect'
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}
export const baseHandler = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    // 让当前的key 和 effect关联起来即可
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    // 数据变化后，要根据属性找到对应的effect列表让其依次执行
    let oldValue = target[key]
    if (oldValue !== value) {
      let result = Reflect.set(target, key, value, receiver)
      trigger(target, key, value)
      return result
    }
  },
}
