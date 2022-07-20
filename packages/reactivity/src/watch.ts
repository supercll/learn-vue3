import { ReactiveEffect } from './effect'
import { isReactive } from './baseHandler'
import { isFunction, isObject } from '@vue/shared'
// 对value进行迭代访问，这样稍后执行effect的时候 会默认去值，就会依赖收集
function traversal(value, set = new Set()) {
  // set用来存放我迭代过的对象
  // 递归访问
  if (!isObject(value)) {
    return value // 终止条件
  }
  if (set.has(value)) {
    return value
  }
  set.add(value) // 此对象已经被迭代过了
  for (let key in value) {
    traversal(value[key], set)
  }
  return value
}
export function watch(source, cb) {
  let get
  if (isReactive(source)) {
    // 创建一个effect，让这个effect收集source中的所有属性
    get = () => traversal(source)
  } else if (isFunction(source)) {
    get = source // 直接source是一个函数是可以的
  }
  let oldValue
  let cleanup
  const onCleanup = fn => {
    cleanup = fn
  }
  const job = () => {
    cleanup && cleanup() // 如果cleanup有值，则是上一次赋予的
    // 数据变化后重新调用effect.run函数，会获得最新的值
    let newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
  const effect = new ReactiveEffect(get, job)
  // 默认调用run方法会执行get函数，此时source作为了第一次的老值
  oldValue = effect.run() // 默认执行get方法
}
