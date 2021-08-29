/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
import ARRAY from '../props/Array.js'
import { CHANGE } from '../props/events/events.js'
import { fn } from 'jest-mock'
import STRING from '../props/String.js'
import INTEGER from '../props/Integer.js'
export { default as PROPEVENTS } from '../props/classes/PropEvents.js'
export { default as EVENTS } from '../props/events/events.js'
const waitFor = check => {
  return new Promise((resolve, reject) => {
    const timedCheck = () => {
      setTimeout(() => {
        if (check()) return resolve()
        timedCheck()
      }, 20)
    }
    timedCheck()
  })
}
describe('Arrays', () => {
  it('Build with schema', () => {
    const model = new ARRAY([{
      name: 'Paul',
      age: 21,
      today: new Date()
    }, {
      name: 'John',
      age: 20,
      today: new Date()
    }])
    const data = [...model]
    expect(data[0].name instanceof STRING).toBe(true)
    expect(data[0].age instanceof INTEGER).toBe(true)
    expect(data[0].name == 'Paul').toBe(true)
  })
  it('Find Array', () => {
    const model = new ARRAY([{
      name: 'Paul',
      age: 21,
      today: new Date()
    }, {
      name: 'John',
      age: 20,
      today: new Date()
    }])
    const Paul = model.find(item => {
      return item.name == 'Paul'
    })
    expect(Paul.age == 21).toBe(true)
  })
  it('Filter Array', () => {
    const model = new ARRAY([{
      name: 'Paul',
      age: 21,
      today: new Date()
    }, {
      name: 'John',
      age: 20,
      today: new Date()
    }, {
      name: 'Sabine',
      age: 22,
      today: new Date()
    }])
    const Older = model.filter(item => {
      return item.age > 20
    })
    expect(Older.length).toBe(2)
  })
  it('Sort Array', () => {
    const model = new ARRAY([{
      name: 'Paul',
      age: 21,
      today: new Date()
    }, {
      name: 'John',
      age: 20,
      today: new Date()
    }, {
      name: 'Sabine',
      age: 22,
      today: new Date()
    }])
    const byAge = model.sort((a, b) => {
      return b.age - a.age
    })
    expect(byAge[0].age == 22).toBe(true)
    expect(byAge[2].age == 20).toBe(true)
  })
  it('Array length', () => {
    const model = new ARRAY([{
      name: 'Paul',
      age: 21,
      today: new Date()
    }, {
      name: 'John',
      age: 20,
      today: new Date()
    }, {
      name: 'Sabine',
      age: 22,
      today: new Date()
    }])
    expect(model.length).toBe(3)
  })
  it('Array push json', () => {
    const today = new Date()
    const model = new ARRAY([{
      name: 'Paul',
      age: 21,
      today: today
    }, {
      name: 'John',
      age: 20,
      today: today
    }])
    model.push({
      name: 'Sabine',
      age: 22,
      today: today
    })
    const data = [...model]
    expect(model.length).toBe(3)
    expect(data[2].name == 'Sabine').toBe(true)
    expect(data[2].today == today.getTime()).toBe(true)
  })
  it('Array pop', () => {
    const today = new Date()
    const model = new ARRAY([{
      name: 'Paul',
      age: 21,
      today: today
    }, {
      name: 'John',
      age: 20,
      today: today
    }, {
      name: 'Sabine',
      age: 22,
      today: today
    }])
    const last = model.pop()
    expect(model.length).toBe(2)
    expect(last.name == 'Sabine').toBe(true)
  })
})
