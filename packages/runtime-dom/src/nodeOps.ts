export const nodeOps = {
  createElement(tagName) {
    return document.createElement(tagName)
  },
  createTextNode(text) {
    return document.createTextNode(text)
  },
  insert(element, container, anchor = null) {
    container.insertBefore(element, anchor) // ==appendChild
  },
  remove(child) {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  querySelector(selectors) {
    return document.querySelector(selectors)
  },
  parentNode(child) {
    // 父节点
    return child.parentNode
  },
  nextSibling(child) {
    // 获取兄弟元素
    return child.nextSibling
  },
  setText(element, text) {
    // 给文本节点设置内容
    element.nodeValue = text
  },
  setElementText(element, text) {
    // 给元素节点设置内容 innerHTML
    element.textContent = text
  },
}
// 创建元素节点 创建文本节点  节点的增删查， 获取父子关系
