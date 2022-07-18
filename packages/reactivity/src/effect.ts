export class ReactiveEffect {
  public active = true
  constructor(public fn) {} // 你传递的fn我会帮你放到this上
  run() {
    this.fn() // 去proxy对象上取值
  }
}
export function effect(fn) {
  // 将用户传递的函数编程响应式的effect
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}
