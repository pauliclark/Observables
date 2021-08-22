
import Prop from './classes/Prop.js'
import { DateTime } from 'luxon'
import { CHANGE } from './classes/events.js'
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
class DATE extends Prop {
  setOptions (options) {
    this.options = { ...defaultOptions, ...options }
    luxonMethods.forEach(method => {
      if (method instanceof Array) {
        const [localMethod, dateMethod] = method
        this[localMethod] = (...args) => {
          return this.value[dateMethod](...args)
        }
      } else {
        this[method] = (...args) => {
          const oldValue = this.value
          const newValue = this.value[method](...args)
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
      }
    })
  }

  _set (value, { preventEvent = false } = {}) {
    const oldValue = this.value
    const newValue = this.parse(value)
    this.value = newValue
    if (!preventEvent && !newValue.equals(oldValue)) {
      this._event[CHANGE]()
    }
  }

  parse (value) {
    const parser = parseMatcher.find(p => p.match(value))
    const method = parser ? parser.parse : defaultParser
    // console.log(method)
    const val = DateTime[method](value)
    // console.log(val)
    return val
  }

  toJSON () {
    return (this.value && this.value.toJSDate) ? this.value.toJSDate() : this.value
  }

  valueOf () {
    return (this.value && this.value.toJSDate) ? this.value.toJSDate() : this.value
  }

  toString () {
    return this.value ? (this.value.toJSDate ? this.value.toJSDate().toString() : this.value.toString()) : this.value
  }
}

export default DATE
