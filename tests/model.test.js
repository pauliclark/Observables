/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
import OBJECT from '../props/Object.js'
import { CHANGE } from '../props/classes/events.js'
import { fn } from 'jest-mock'
import waitFor from './waitFor.js'
test('Compare model strings', () => {
  const model = new OBJECT({
    name: 'Paul',
    age: 21,
    today: new Date()
  })
  const model2 = new OBJECT({
    name: 'Paul',
    age: 22,
    today: new Date()
  })
  expect(model.name == 'Paul').toBe(true)
  expect(model.name.toString() == model2.name.toString()).toBe(true)
})

test('Compare model numbers', () => {
  const model = new OBJECT({
    name: 'Paul',
    age: 20,
    today: new Date()
  })
  const model2 = new OBJECT({
    name: 'Paul',
    age: 10,
    today: new Date()
  })
  const model3 = new OBJECT({
    name: 'Tami',
    age: 10,
    male: false,
    today: new Date()
  })
  expect(model.age == 20).toBe(true)
  expect(model3.age * 1 == model2.age).toBe(true)
  expect(model.age > model2.age).toBe(true)
  expect(model.age + model2.age).toBe(30)
  expect(model.age / model2.age).toBe(2)
  expect(model.age * model2.age).toBe(200)
})

test('Compare model booleans', () => {
  const model = new OBJECT({
    name: 'Paul',
    age: 20,
    male: true,
    today: new Date()
  })
  const model2 = new OBJECT({
    name: 'Paul',
    age: 10,
    male: true,
    today: new Date()
  })
  const model3 = new OBJECT({
    name: 'Tami',
    age: 10,
    male: false,
    today: new Date()
  })
  expect(model.male == true).toBe(true)
  expect(!!model.male == model2.male).toBe(true)
  expect(!!model.male === model2.male).toBe(false)
  expect(!!model.male == model3.male).toBe(false)
})

test('Compare nested objects', () => {
  const model = new OBJECT({
    name: 'Paul',
    details: {
      age: 20,
      male: true
    }
  })
  const model2 = new OBJECT({
    name: 'Paul',
    details: {
      age: 10,
      male: true
    }
  })
  const model3 = new OBJECT({
    name: 'Tami',
    details: {
      age: 10,
      male: false
    }
  })
  // console.log(model.details.male)
  expect(model.details.male == true).toBe(true)
  expect(!!model.details.male == model2.details.male).toBe(true)
  expect(!!model.details.male === model2.details.male).toBe(false)
  expect(!!model.details.male == model3.details.male).toBe(false)
})

test('Listen for changes', async () => {
  const model = new OBJECT({
    name: 'Paul',
    details: {
      age: 20,
      male: true
    }
  })
  const mainCallback = fn()
  const detailsCallback = fn()
  const ageCallback = fn()
  model.on(CHANGE, mainCallback)
  model.details.on(CHANGE, detailsCallback)
  model.details.age.on(CHANGE, ageCallback)
  model.details.age++
  await waitFor(() => {
    return mainCallback.mock.calls.length
  })

  expect(model.details.age.valueOf()).toBe(21)
  expect(mainCallback.mock.calls.length).toBe(1)
  expect(mainCallback.mock.calls[0][0]).toBe(model.details.age)
  expect(mainCallback.mock.calls[0][1]).toBe(true)

  expect(detailsCallback.mock.calls.length).toBe(1)
  expect(detailsCallback.mock.calls[0][0]).toBe(model.details.age)
  expect(detailsCallback.mock.calls[0][1]).toBe(true)

  expect(ageCallback.mock.calls.length).toBe(1)
  expect(ageCallback.mock.calls[0][0]).toBe(model.details.age)
  expect(ageCallback.mock.calls[0][1]).toBe(false)
})
