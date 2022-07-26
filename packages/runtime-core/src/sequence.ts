export function getSequence(arr) {
  const len = arr.length
  const indexResult = [0] // 保存最长递增子序列的索引
  const tmpArr = []
  let resultLastIndex // 相当于指针，指向最长递增子序列顶部
  let start
  let end
  let mid = 0

  for (let i = 0; i < len; i++) {
    const arrItem = arr[i] // 获取数组中的每一项，但是0 没有意义我们需要忽略掉
    if (arrItem !== 0) {
      resultLastIndex = indexResult[indexResult.length - 1]
      if (arr[resultLastIndex] < arrItem) {
        tmpArr[i] = resultLastIndex // 标记当前前一个对应的索引

        indexResult.push(i)
        console.log(arrItem, i, resultLastIndex, indexResult, tmpArr)

        // 当数组取值大于目前递增序列最大值
        continue
      }
      console.log(arrItem, i, resultLastIndex, indexResult, tmpArr)

      start = 0
      end = indexResult.length - 1
      while (start < end) {
        mid = Math.floor((end + start) / 2)

        if (arr[indexResult[mid]] < arrItem) {
          start = mid + 1
        } else {
          end = mid
        }
      }
      const oldArrItem = arr[indexResult[start]] || -Infinity
      if (arrItem < oldArrItem) {
        tmpArr[i] = indexResult[start - 1] // 将要替换的前一个记住
        indexResult[start] = i
      }
    }
  }

  let i = indexResult.length // 总长度
  let lastIndex = indexResult[i - 1] // 找到了最后一项
  while (i-- > 0) {
    console.log(i, lastIndex, tmpArr[lastIndex]);
    
    // 根据前驱节点一个个向前查找
    indexResult[i] = lastIndex // 最后一项肯定是正确的
    lastIndex = tmpArr[lastIndex]
  }
  console.log(
    'valueArr: ',
    indexResult.map(itemIndex => {
      return arr[itemIndex]
    }),
  )

  return indexResult
}
