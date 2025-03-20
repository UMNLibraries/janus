'use strict'
import util from 'util'

function InvalidArgumentError (message) {
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = message
}
util.inherits(InvalidArgumentError, Error)
export default InvalidArgumentError