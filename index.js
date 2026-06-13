// Polyfill must run before expo-router/entry loads any modules
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message)
      this.name = name || 'DOMException'
    }
  }
}

require('expo-router/entry')
