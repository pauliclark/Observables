
class baseObservable {
  parent = null
  constructor (parent) {
    this.parent = parent
  }
  getKeyOfChild = function (child) {
    const keys = Object.keys(this.data)
    return keys.find(key => {
      return this.data[key] === child
    })
  }
  getKey = function () {
    if (this.parent) return this.parent.getKeyOfChild(this)
    return null
  }
  setCache = function () {
    this.cache = JSON.parse(JSON.stringify(this))
  }
  data = {}
  watchers = []
  bubbleWatchers = []
  deleteWatchers = []
  onDelete = function (method) {
    this.deleteWatchers.push(method)
  }
  deleted = function () {
    while (this.deleteWatchers.length) {
      this.deleteWatchers.pop()()
    }
  }
  watch = function (method, bubble = true, onceOnly = false) {
    let callback = onceOnly ? (...args) => {
      method(...args)
      throw new Error('Already run')
    } : method
    this[bubble ? 'bubbleWatchers' : 'watchers'].push(callback)
  }
  changed = function (fromUpdate) {
    // console.log({ changed: this, fromUpdate })
    const value = this.get ? this.get() : (this.values || this.value)
    // console.log('watchers', this.watchers.length)
    for (let w = this.watchers.length - 1; w >= 0; w--) {
      try {
        // console.log(value)
        this.watchers[w](value, fromUpdate)
      } catch (e) {
        // console.error(e)
        this.watchers.splice(w, 1)
      }
    }
    // console.log(this.getKey(), this.watchers.length)
    this.bubble(fromUpdate)
  }
  bubble = function (fromUpdate) {
    // console.log('bubblewatchers', this.bubbleWatchers.length)
    const value = this.get ? this.get() : (this.values || this.value)
    for (let w = this.bubbleWatchers.length - 1; w >= 0; w--) {
      try {
        this.bubbleWatchers[w](value, fromUpdate)
      } catch (e) {
        // console.error(e)
        this.bubbleWatchers.splice(w, 1)
        // console.log(this.getKey(), this.bubbleWatchers.length)
      }
    }
    // console.log(this.bubbleWatchers.length)
    if (this.parent && this.parent.bubble) this.parent.bubble(fromUpdate)
  }

  // modified = []
  // clearModified = function () {
  //   this.modified = []
  // }
  // isModified = function (k = null) {
  //   if (k === null) return this.modified.length
  //   return this.modified.includes(k)
  // }
  // getModified = function () {
  //   const dif = this.diff()
  //   console.log(dif)
  //   return dif
  // }
  // cache = {}
  // diff = function () {
  //   let o1 = this.cache
  //   let o2 = JSON.parse(JSON.stringify(this))
  //   let diff = Object.keys(o2).reduce((diff, key) => {
  //     if (o1[key] === o2[key]) return diff
  //     return {
  //       ...diff,
  //       [key]: o2[key]
  //     }
  //   }, {})
  //   console.log(o2)
  //   this.setCache()
  //   return diff
  // }
}

export { baseObservable }
