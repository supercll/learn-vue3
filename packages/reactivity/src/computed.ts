import { isFunction } from '@vue/shared'
import {
  activeEffect,
  ReactiveEffect,
  track,
  trackEffects,
  triggerEffects,
} from './effect'

export function computed(getterOrOptions) {
  let isGetter = isFunction(getterOrOptions)

  let getter
  let setter

  const fn = () => console.warn('computed is readonly ')
  if (isGetter) {
    getter = getterOrOptions
    setter = fn
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set || fn
  }
  return new ComputedRefImpl(getter, setter)
}
class ComputedRefImpl {
  private _value // 计算属性返回值
  private _dirty = true // 用于控制缓存
  public effect // 计算属性的effect对象
  public deps // 计算属性的依赖
  constructor(getter, public setter) {
    // 拿到effect实例让函数执行

    // effect.deps 存的是属性对应的set集合
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
        // 通知自己收集的effect执行
        triggerEffects(this.deps)
      }
    })
  }
  get value() {
    // 只有当.value 的时候 dirty为true就执行
    if (activeEffect) {
      // 让计算属性做依赖收集
      // 计算属性 -》 effect  set = [effect]
      trackEffects(this.deps || (this.deps = new Set()))
    }
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
  set value(newValues) {
    this.setter(newValues)
  }
}
