'use strict'

const path = require('path')
const fs = require('fs-extra')
const tinify = require('tinify')
const ora = require('ora')
const logSymbols = require('log-symbols')
const chalk = require('chalk')
const shell = require('shelljs')
const log = console.log

const question = require('./question')
const findFile = require('./findFile')

const keyPath = process.env.HOME + '/.tinypng'
const pwdPath = process.env.PWD

async function main () {
  // 获取key
  await fs.ensureFile(keyPath)
  let keyObj
  const data = await fs.readJson(keyPath, { throws: false })
  if (0) {
    console.log('keypath',keyPath)
    keyObj = data
  } else {
    const answers = await question()
    await fs.outputJson(keyPath, answers)
    keyObj = answers
  }
  compress(keyObj.APIKey)

}

//压缩方法
async function compress (APIKey){
  shell.exec('clear')
  const startTimeStamp = Date.now()
  tinify.key = APIKey

  // 创建目录
  // const pathTmp = pwdPath + '/compressed/'
  // await fs.emptyDir(pathTmp)
//"APIKey2":"399pdSylYGJlBBcN3rwl0QpRZkv9px4T"
//"APIKey":fnRzjdvL9GpChvyWpCCPBbyyCC6hd2nr
  const spinner = ora({ text: '', color: 'green' }).start()

  // 获取图片文件
  const files = findFile(pwdPath)
  // const files = findFile('/Users/liubohao/Downloads/image')
  const images = files.filter((file) => {
    const ext = path.extname(file)
    return ['.png', '.jpg', '.jpeg','.PNG','.JPEG','.JPG'].indexOf(ext) > -1
  })
  // return
  let counter = images.length
  if (images.length) {
    spinner.info('欢迎使用tiny压缩图片! 查找到' + images.length + '张图片...')
  }

  // 压缩
  for (let img of images) {
    spinner.start(chalk.blue.bold(counter-- + '/' + images.length + ' 压缩中... ') + img)

    try {
      const basename = path.basename(img)
      const dirname = path.dirname(img)
      const source = await tinify.fromFile(img)
      
      console.log('dirname=',dirname)
      await source.toFile(dirname+'/' + basename)
      // await source.toFile(basename)
    } catch (e) {
      console.error(e)
    }
  }

  // 完成
  if (images.length) {
    const endTimeStamp = Date.now()
    spinner.clear()
    spinner.succeed(chalk.green('压缩完成~ 累计压缩' + images.length + '张！'))
    console.log(chalk.green('共用时：' + (endTimeStamp - startTimeStamp) / 1000 + 's  已压缩文件保存在compressed中。'))
  } else {
    spinner.clear()
    spinner.fail(chalk.red('当前目录未找到图片文件。'))
  }
}

main().catch((err) => {
  console.error(err)
})
