/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
import { CHANGE } from '../props/events/events.js'
import { fn } from 'jest-mock'
import DATE from '../props/Date.js'
import waitFor from './waitFor.js'
describe('Dates', () => {
  it('Date value of', () => {
    const testDate = new Date('2010-01-01 00:00:00.000')
    const date = new DATE(testDate)
    const dateString1 = date.toFormat('yyyy LLL dd HH:mm')
    expect(dateString1).toBe('2010 Jan 01 00:00')
  })
  it('Date add a day', async () => {
    const callback = fn()
    const testDate = new Date('2010-01-01 00:00:00.000')
    const date = new DATE(testDate)
    date.on(CHANGE, callback)
    const dateString1 = date.toFormat('yyyy LLL dd HH:mm')
    expect(dateString1).toBe('2010 Jan 01 00:00')
    date.plus({ days: 1 })
    await waitFor(() => {
      return callback.mock.calls.length
    })
    const dateString2 = date.toFormat('yyyy LLL dd HH:mm')
    expect(dateString2).toBe('2010 Jan 02 00:00')
  })
})
