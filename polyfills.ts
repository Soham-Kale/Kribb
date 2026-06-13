// Hermes does not include browser APIs — define them before any library loads

if (typeof global.DOMException === 'undefined') {
  (global as any).DOMException = class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message)
      this.name = name ?? 'DOMException'
    }
  }
}
