const queue = []
let isFlushing = false

const resolvePromise = Promise.resolve()
export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job)
  }
  //开一个定时器批量处理
  if (!isFlushing) {
    isFlushing = true
    resolvePromise.then(() => {
      isFlushing = false
      let copyQueue = queue.slice(0)
      queue.length = 0

      for (let i = 0; i < copyQueue.length; i++) {
        let job = copyQueue[i]
        job()
      }
      copyQueue.length = 0
    })
  }

  // 类似于浏览器的事件环， 将任务放到队列中，去重, 异步调用任务
}
