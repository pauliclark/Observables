/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
import User from '../props/sample/User.js'
import UserReference from '../props/sample/UserReference.js'
import ARRAY from '../props/Array.js'
import { LOAD } from '../props/events/events.js'
import { fn } from 'jest-mock'
import waitFor from './waitFor.js'
import store from '../props/containers/models.js'

describe('Model Referencing', () => {
  it('Model constructor', () => {
    const model = new User({
      id: 1,
      name: 'Paul'
    })
    const model2 = new User({
      id: 2,
      name: 'Frank'
    })
    expect(model.name == 'Paul').toBe(true)
    expect(store.User.models['1'].name == 'Paul').toBe(true)
    expect(store.User.findByPKey(1).name == 'Paul').toBe(true)
    expect(store.User.findByPKey(2).name == 'Frank').toBe(true)
  })
  it('Model to Model reference', async () => {
    const model = new User({
      id: 1,
      name: 'Paul',
      friend: 2
    })
    const model2 = new User({
      id: 2,
      name: 'Frank'
    })
    await waitFor(() => model.friend._ref !== null)
    expect(store.User.models['1'].name == 'Paul').toBe(true)
    expect(model._friend.name == 'Frank').toBe(true)
  })
  it('Model to Model reference with an onLoad', async () => {
    const model = new User({
      id: 1,
      name: 'Paul',
      friend: 2
    })
    let loaded = false
    model.friend.on(LOAD, () => {
      loaded = true
    })
    const model2 = new User({
      id: 2,
      name: 'Frank'
    })
    await waitFor(() => loaded)
    expect(store.User.models['1'].name == 'Paul').toBe(true)
    expect(model._friend.name == 'Frank').toBe(true)
  })
  it('Model to Model reference, where ref already exists', async () => {
    const model2 = new User({
      id: 2,
      name: 'Frank'
    })
    let loaded = false
    const model = new User({
      id: 1,
      name: 'Paul',
      friend: 2
    })
    model.friend.on(LOAD, () => {
      loaded = true
    })
    await waitFor(() => loaded)
    expect(store.User.models['1'].name == 'Paul').toBe(true)
    // console.log(`${model._friend.name}`)
    expect(model._friend.name == model2.name.toString()).toBe(true)
  })
  it('Array of Model references', async () => {
    const model = new User({
      id: 1,
      name: 'Paul',
      friend: 2
    })
    const model2 = new User({
      id: 2,
      name: 'Frank'
    })
    const model3 = new User({
      id: 3,
      name: 'Debbie'
    })
    const list = new ARRAY(UserReference, { values: [1, 2, 3] })
    const users = (await Promise.all(list.map(u => new Promise((resolve) => {
      u.on(LOAD, resolve)
    })))).map(u => u._ref)
    expect(users[0].name == 'Paul').toBe(true)
    expect(users[1].name == 'Frank').toBe(true)
    expect(users[2].name == 'Debbie').toBe(true)
  })
  it('Array of Reversed Model references', async () => {
    const model = new User({
      id: 1,
      name: 'Paul',
      friend: 2
    })
    const model2 = new User({
      id: 2,
      name: 'Frank'
    })
    const model3 = new User({
      id: 3,
      name: 'Debbie'
    })
    const list = new ARRAY(UserReference, { values: [1, 2, 3] })
    list.reverse()
    const users = (await Promise.all(list.map(u => new Promise((resolve) => {
      u.on(LOAD, resolve)
    })))).map(u => u._ref)
    expect(users[2].name == 'Paul').toBe(true)
    expect(users[1].name == 'Frank').toBe(true)
    expect(users[0].name == 'Debbie').toBe(true)
    expect(users[2]._friend.name == 'Frank').toBe(true)
  })

  it('Array of Model references before loading', async () => {
    const list = new ARRAY(UserReference, { values: [1, 2, 3] })
    const users = []
    Promise.all(list.map(u => new Promise((resolve) => {
      u.getRef().then(resolve)
    }))).then(refs => {
      while (refs.length) users.push(refs.shift())
    })

    // console.log(users.length)
    const model = new User({
      id: 1,
      name: 'Paul',
      friend: 2
    })
    const model2 = new User({
      id: 2,
      name: 'Frank'
    })
    const model3 = new User({
      id: 3,
      name: 'Debbie'
    })
    await waitFor(() => users.length === 3)
    // console.log(users.length)
    expect(users[0].name == 'Paul').toBe(true)
    expect(users[1].name == 'Frank').toBe(true)
    expect(users[2].name == 'Debbie').toBe(true)
  })
})
