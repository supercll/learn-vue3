export let activeEffect = undefined
// 依赖收集的原理是 借助js是单线程的特点， 默认调用effect的时候会去调用proxy的get，此时让属性记住
// 依赖的effect，同理也让effect记住对应的属性
// 靠的是数据结构 weakMap : {map:{key:new Set()}}
// 稍后数据变化的时候 找到对应的map 通过属性出发set中effect
export class ReactiveEffect {
  public active = true
  public parent = null
  public deps = [] // effect中用了哪些属性，后续清理的时候要使用
  constructor(public fn) {} // 你传递的fn我会帮你放到this上
  // effectScope 可以来实现让所有的effect停止
  run() {
    // 依赖收集  让熟悉和effect 产生关联
    if (!this.active) {
      return this.fn()
    } else {
      try {
        this.parent = activeEffect
        activeEffect = this
        return this.fn() // 去proxy对象上取值, 取之的时候 我要让这个熟悉 和当前的effect函数关联起来，稍后数据变化了 ，可以重新执行effect函数
      } finally {
        // 取消当前正在运行的effect
        activeEffect = this.parent
        this.parent = null
      }
    }
  }
}
// 哪个对象中的那个属性 对应的哪个effect  一个属性可以对应多个effect
// 外层用一个map {object: {name:[effect,effect],age:[effect,effect]}}
const targetMap = new WeakMap()
export function trigger(target, key, value) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    return // 属性没有依赖任何的effect
  }
  const effects = depsMap.get(key)
  effects &&
    effects.forEach(effect => {
      if (effect !== activeEffect) {
        // 保证要执行的effect不是当前的effect
        effect.run() // 数据变化了，找到对应的effect 重新执行
      }
    })
}
export function track(target, key) {
  if (activeEffect) {
    // 这里搞依赖收集
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if (!deps) {
      depsMap.set(key, (deps = new Set()))
    }
    let shouldTrack = !deps.has(activeEffect)
    if (shouldTrack) {
      deps.add(activeEffect)
      // 等等 deps 的作用就是让effect 记录用到了哪些属性
      activeEffect.deps.push(deps) // 放的是set
    }
    debugger
  }
  // 让属性记录所用到的effect是谁， 哪个effect对应了哪些属性
}

export function effect(fn) {
  // 将用户传递的函数编程响应式的effect
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

// activeEffect = e2;
// effect(()=>{ // e1  e1.parent = null
//     state.name;  // name = e1
//     effect(()=>{ // e2  e2.parent = e1;
//         state.age; // age = e2
//     })
//     // activeeffect = e2.parent
//     state.address; // address = e1
// })