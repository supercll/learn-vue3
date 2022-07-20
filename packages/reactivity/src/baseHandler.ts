import { isObject } from '@vue/shared'
import { reactive } from './reactive'
import { track, trigger } from './effect'
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}
export function isReactive(value) {
  return value && value[ReactiveFlags.IS_REACTIVE]
}

export const baseHandler = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    track(target, key)
    let res = Reflect.get(target, key, receiver)
    if (isObject(res)) {
      return reactive(res)
    }
    return res
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
