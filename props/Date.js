
import Prop from './classes/Prop.js'
import { DateTime } from 'luxon'
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
const luxonExpose = luxonMethods.reduce((acc, val) => {
  if (val instanceof Array) {
    acc[val[0]] = val[1]
  } else {
    acc[val] = val
  }
  return acc
}, {})
class DATE extends Prop {
  setOptions (options) {
    this.options = { ...defaultOptions, ...options }
    Object.entries(luxonExpose).forEach((localMethod, luxonMethod) => {
      this[localMethod] = (...args) => {
        return this.value[luxonMethod](...args)
      }
    })
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
