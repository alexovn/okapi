import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

const files = ['README.md', 'LICENSE']

/**
 * @param {string} file
 * @returns {string}
 */
const destination = (file) => {
  return resolve(import.meta.dirname, '..', `packages/lib/${file}`)
}

const copyPublishFiles = () => {
  for (const file of files) {
    const filePath = resolve(import.meta.dirname, '..', file)

    copyFileSync(filePath, destination(file))
  }
}

copyPublishFiles()
