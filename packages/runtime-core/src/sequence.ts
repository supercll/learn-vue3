// function getSequence(arr) {
//   const len = arr.length
//   const result = [0] // 保存最长递增子序列的索引
//   let resultLastIndex

//   for (let i = 0; i < len; i++) {
//     const arrI = arr[i] // 获取数组中的每一项，但是0 没有意义我们需要忽略掉
//     if (arrI !== 0) {
//       resultLastIndex = result[result.length - 1]
//       if (arr[resultLastIndex] < arrI) {
//         result.push(i) // 记录索引
//         continue
//       }
//     }
//   }
//   return result
// }
// // 针对默认递增的序列进行优化
// console.log(getSequence([2, 6, 7, 8, 9, 11]))

// export function getSequence(arr) {
//   const len = arr.length
//   const result = [0] // 保存最长递增子序列的索引
//   let resultLastIndex
//   let start
//   let end
//   let middle = 0
//   for (let i = 0; i < len; i++) {
//     const arrI = arr[i] // 获取数组中的每一项，但是0 没有意义我们需要忽略掉
//     if (arrI !== 0) {
//       resultLastIndex = result[result.length - 1]
//       if (arr[resultLastIndex] < arrI) {
//         result.push(i) // 记录索引
//         continue
//       }
//       start = 0
//       end = result.length - 1 // 二分查找 前后索引
//       while (start < end) {
//         // 最终start = end
//         middle = ((start + end) / 2) | 0 // 向下取整
//         // 拿result中间值和最后一项比较
//         if (arr[result[middle]] < arrI) {
//           // 找比arrI大的值 或者等于arrI
//           start = middle + 1
//         } else {
//           end = middle
//         }
//       }
//       if (arrI < arr[result[start]]) {
//         // 当前这个小就替换掉
//         result[start] = i
//       }
//     }
//   }
//   return result
// }

function getSequence(arr) {
  // 最终的结果是索引
  const len = arr.length
  const result = [0] // 索引  递增的序列 用二分查找性能高
  const p = arr.slice(0) // 里面内容无所谓 和 原本的数组相同 用来存放索引
  let start
  let end
  let middle
  for (let i = 0; i < len; i++) {
    // O(n)
    const arrI = arr[i]
    if (arrI !== 0) {
      let resultLastIndex = result[result.length - 1]
      // 取到索引对应的值
      if (arr[resultLastIndex] < arrI) {
        p[i] = resultLastIndex // 标记当前前一个对应的索引
        result.push(i)
        // 当前的值 比上一个人大 ，直接push ，并且让这个人得记录他的前一个
        continue
      }
      // 二分查找 找到比当前值大的那一个
      start = 0
      end = result.length - 1
      while (start < end) {
        // 重合就说明找到了 对应的值  // O(logn)
        middle = ((start + end) / 2) | 0 // 找到中间位置的前一个
        if (arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        } // 找到结果集中，比当前这一项大的数
      }
      // start / end 就是找到的位置
      if (arrI < arr[result[start]]) {
        // 如果相同 或者 比当前的还大就不换了
        if (start > 0) {
          // 才需要替换
          p[i] = result[start - 1] // 要将他替换的前一个记住
        }
        result[start] = i
      }
    }
  }
  let i = result.length // 总长度
  let last = result[i - 1] // 找到了最后一项
  while (i-- > 0) {
    // 根据前驱节点一个个向前查找
    result[i] = last // 最后一项肯定是正确的
    last = p[last]
  }
  return result
}
console.log(getSequence([2, 3, 1, 5, 6, 8, 7, 9, 4]))
