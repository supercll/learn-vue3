export const isObject = value => {
  return typeof value === 'object' && value !== null
}
export const isFunction = value => {
  return typeof value === 'function'
}

export const isString = value => {
  return typeof value === 'string'
}
export const isArray = Array.isArray

export const isNumber = value => {
  return typeof value === 'number'
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (obj, key) => hasOwnProperty.call(obj, key)

// 调用生命周期函数
export function invokerFns(fns) {
  for (let i = 0; i < fns.length; i++) {
    fns[i]()
  }
}
