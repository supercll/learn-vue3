// 给属性打补丁 {style:{color:'red'}}   {style:{}}

import { patchAttr } from './patch-prop/patchAttr'
import { patchClass } from './patch-prop/patchClass'
import { patchEvent } from './patch-prop/patchEvent'
import { patchStyle } from './patch-prop/patchStyle'

// 类名，
// 行内样式
// 事件
// 其他属性

// click ()=> fn1()  ->  fn2()  不需要每次重新 add和remove

// checked   default-value  innerHTML
export const patchProp = (el, key, preValue, nextValue) => {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, preValue, nextValue)
  } else if (/on[^a-z]/.test(key)) {
    //onClick onMousedown
    patchEvent(el, key, nextValue)
  } else {
    patchAttr(el, key, nextValue)
  }
}
