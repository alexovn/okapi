import { ABORT_ERROR, TIMEOUT_ERROR } from '../constants'
import { isObject } from './isObject'

export function isAbortError(error: unknown, force = false): boolean {
  if (force) {
    return true
  }
  return isObject(error) && 'name' in error && error.name === ABORT_ERROR
}

export function isTimeoutError(error: unknown, force = false): boolean {
  if (force) {
    return true
  }
  return isObject(error) && 'name' in error && error.name === TIMEOUT_ERROR
}
