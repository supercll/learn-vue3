import { isObject } from '@vue/shared'
import { trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

export function toReactive(value) {
  // rawValue 可能是一个对象，
  return isObject(value) ? reactive(value) : value
}
function createRef(rawValue, shallow) {
  return new RefImpl(rawValue, shallow) // 将值进行装包
}

export function ref(value) {
  return createRef(value, false)
}
// 创建浅ref 不会进行深层代理
export function shallowRef(value) {
  return createRef(value, true)
}

export function toRef(object, key) {
  return new ObjectRefImpl(object, key)
}

export function toRefs(object) {
  let result = {}
  for (let key in object) {
    result[key] = toRef(object, key)
  }
  return result
}
export function proxyRefs(objectWithRefs) {
  // 代理的思想，如果是ref 则取ref.value
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      let v = Reflect.get(target, key, receiver)
      return v.__v_isRef ? v.value : v
    },
    set(target, key, value, receiver) {
      // 设置的时候如果是ref,则给ref.value赋值
      const oldValue = target[key]
      if (oldValue.__v_isRef) {
        oldValue.value = value
        return true
      } else {
        return Reflect.set(target, key, value, receiver)
      }
    },
  })
}

class ObjectRefImpl {
  private __v_isRef = true
  constructor(public object, public key) {}
  get value() {
    return this.object[this.key]
  }
  set value(newValue) {
    this.object[this.key] = newValue
  }
}
class RefImpl {
  private _value
  private dep
  private __v_isRef = true
  constructor(public rawValue, public _shallow: boolean) {
    this._value = _shallow ? rawValue : toReactive(rawValue) // 浅ref不需要再次代理
  }
  get value() {
    trackEffects(this.dep || (this.dep = new Set()))
    // 这里需要依赖收集，取值的时候 需要收集对应的依赖
    return this._value
  }
  set value(newValue) {
    if (newValue != this.rawValue) {
      this._value = toReactive(newValue)
      this.rawValue = newValue
      triggerEffects(this.dep)
    }
  }
}
