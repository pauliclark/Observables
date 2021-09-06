
import Prop from './classes/Prop.js'
import { DateTime } from 'luxon'
import { CHANGE } from './events/events.js'
const defaultParser = 'fromJSDate'
const parseMatcher = [
  {
    match: val => val instanceof Date,
    parse: 'fromJSDate'
  },
  {
    match: val => val && val.match(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+/),
    parse: 'fromISO'
  }
]
const defaultOptions = {
}
const luxonMethods = [
  ['getUnit', 'get'],
  'isValid',
  'invalidReason',
  'invalidExplanation',
  'locale',
  'numberingSystem',
  'outputCalendar',
  'zone',
  'zoneName',
  'year',
  'quarter',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'millisecond',
  'weekYear',
  'weekNumber',
  'weekday',
  'ordinal',
  'monthShort',
  'monthLong',
  'weekdayShort',
  'weekdayLong',
  'offset',
  'offsetNameShort',
  'offsetNameLong',
  'isOffsetFixed',
  'isInDST',
  'isInLeapYear',
  'daysInMonth',
  'daysInYear',
  'weeksInWeekYear',
  'resolvedLocaleOptions',
  'toUTC',
  'toLocal',
  'setZone',
  'reconfigure',
  'setLocale',
  'set',
  'plus',
  'minus',
  'startOf',
  'endOf',
  'toFormat',
  'toLocaleString',
  'toLocaleParts',
  'toISO',
  'toISODate',
  'toISOWeekDate',
  'toISOTime',
  'toRFC2822',
  'toHTTP',
  'toSQLDate',
  'toSQLTime',
  'toSQL',
  'toString',
  'valueOf',
  'toMillis',
  'toSeconds',
  'toJSON',
  'toBSON',
  'toObject',
  'toJSDate',
  'diff',
  'diffNow',
  'until',
  'hasSame',
  'equals',
  'toRelative',
  'toRelativeCalendar'
]

/**
 * The Observable DATE Class
 */
class DATE extends Prop {
  /**
 * @param {Date} value - The initial value of the Date
 * @param {Object} options
 * @param {OBJECT} options.parent - The Parent Object to which this Date is a member of
 * @param {String} options.name -The Name/key in the Parent Object to which this Date is assigned
 */
  constructor (value, { parent, name } = {}) {
    super(value, { parent, name })
  }

  /**
   * @ignore
 */
  _setOptions (options = {}) {
    this._options = { ...defaultOptions, ...options }
    luxonMethods.forEach(method => {
      const [localMethod, dateMethod] = (method instanceof Array) ? method : [method, method]
      this[localMethod] = (...args) => {
        if (!this || !this.value) return
        const oldValue = this.value
        const newValue = this.value[dateMethod](...args)
        if (newValue instanceof DateTime) {
          this.value = newValue
          // console.log(oldValue.toJSDate(), newValue.toJSDate(), newValue.equals(oldValue))
          if (!newValue.equals(oldValue)) {
            // console.log(CHANGE)
            this._event[CHANGE]()
          }
        }
        // console.log(newValue)
        return newValue
      }
    })
  }

  /**
   * @ignore
 */
  [Symbol.toPrimitive] (hint) {
    switch (hint) {
      case 'number':
        return this.value.toJSDate ? this.value.toJSDate().getTime() : this.value
      case 'string':
        return this.toString()
      case 'default':
        return this.value.toJSDate ? this.value.toJSDate().getTime() : this.value
    }
    return this.get()
  }

  /**
   * @ignore
 */
  _set (value, { preventEvent = false } = {}) {
    const oldValue = this.value
    const newValue = this.parse(value)
    this.value = newValue
    if (!preventEvent && !newValue.equals(oldValue)) {
      this._event[CHANGE]()
    }
  }

  /**
   * Parses the Date
 * @param {any} value - The value to be parsed
 * @returns {Date} - The parsed Date
 */
  parse (value) {
    const parser = parseMatcher.find(p => p.match(value))
    const method = parser ? parser.parse : defaultParser
    // console.log(method)
    const val = DateTime[method](value)
    // console.log(val)
    return val
  }

  /**
   * @ignore
 */
  toJSON () {
    return (this.value && this.value.toJSDate) ? this.value.toJSDate() : this.value
  }

  /**
   * @ignore
 */
  valueOf () {
    return (this.value && this.value.toJSDate) ? this.value.toJSDate() : this.value
  }

  /**
   * @ignore
 */
  toString () {
    return this.value ? (this.value.toJSDate ? this.value.toJSDate().toString() : this.value.toString()) : this.value
  }
}

export default DATE
