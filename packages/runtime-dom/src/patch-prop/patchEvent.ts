function createInvoker(preValue) {
  const invoker = e => {
    invoker.value(e)
  } // 这个地方需要调用才会执行 invoker.value

  invoker.value = preValue // 后续只需要修改value的引用就可以 达到调用不同的逻辑
  return invoker
}
export function patchEvent(el, eventName, nextValue) {
  const invokers = el._vei || (el._vei = {})
  const exitingInvoker = invokers[eventName]

  if (exitingInvoker && nextValue) {
    // 进行换绑
    exitingInvoker.value = nextValue
  } else {
    // 不存在缓存的情况  addEventListener('click')
    const eName = eventName.slice(2).toLowerCase()
    if (nextValue) {
      const invoker = createInvoker(nextValue) // 默认会将第一次的函数绑定到invoker.value上
      // el._vei  = {onClick: invoker}
      invokers[eventName] = invoker // 缓存invoker
      el.addEventListener(eName, invoker)
    } else if (exitingInvoker) {
      // 没有新的值，但是之前绑定过 我需要删除老
      el.removeEventListener(eName, exitingInvoker)
      invokers[eventName] = null // 缓存invoker
    }
  }
}
