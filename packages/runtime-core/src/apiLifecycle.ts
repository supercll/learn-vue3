import { instance, setCurrentInstance } from './component'

export const enum LifeCycle {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  UPDATED = 'u',
}

function createInvoker(type) {
  // 每次调用 onMounted(()=>{})  onMounted => currentInstance

  // currentInstance 就是当前调用onMounted 所在的组件的实例，后续instance 变化了不会影响 currentInstance
  return function (hook, currentInstance = instance) {
    if (currentInstance) {
      // 将钩子函数保存在组件实例上
      const lifeCycles = currentInstance[type] || (currentInstance[type] = [])
      // 传入的钩子函数
      const wrapHook = () => {
        // AOP
        setCurrentInstance(currentInstance)
        hook.call(currentInstance) // 这里的instance可以取到原因在于倒是闭包里的
        setCurrentInstance(null)
      }
      lifeCycles.push(wrapHook)
    }
  }
}

// 借助函数科里化 实现参数的内置

export const onBeforeMount = createInvoker(LifeCycle.BEFORE_MOUNT)
export const onMounted = createInvoker(LifeCycle.MOUNTED)
export const onUpdated = createInvoker(LifeCycle.UPDATED)
