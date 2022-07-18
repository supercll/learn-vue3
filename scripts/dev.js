const args = require('minimist')(process.argv.slice(2)) // minimist 可以解析命令行参数，非常好用，功能简单不复杂
const path = require('path')

const target = args._[0] || 'reactivity'

const format = args.f || 'global'

const entry = path.resolve(__dirname, `../packages/${target}/src/index.ts`)

const globalName = require(path.resolve(
  __dirname,
  `../packages/${target}/package.json`,
)).buildOptions?.name

// iife 自执行函数 global  (function(){})()  增加一个全局变量
// cjs  commonjs 规范
// esm es6Module

const outputFormat = format.startsWith('global')
  ? 'iife'
  : format === 'cjs'
  ? 'cjs'
  : 'esm'

const outfile = path.resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`,
)

console.log(outfile);

const { build } = require('esbuild')

build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  sourcemap: true,
  format: outputFormat,
  globalName,
  platform: format === 'cjs' ? 'node' : 'browser',
  watch: {
    // 监控文件变化
    onRebuild(error) {
      if (!error) console.log(`rebuilt~~~~`)
    },
  },
}).then(() => {
  console.log('watching~~~')
})
