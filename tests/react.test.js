/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/**
 * @jest-environment jsdom
 */

import OBJECT from '../props/Object.js'
import React from 'react'
import { render } from 'react-dom'
import ObjectAge from './components/ObjectAge.js'
import { act } from 'react-dom/test-utils'
import { CHANGE } from '../props/classes/events.js'
import { fn } from 'jest-mock'
// import { JSDOM } from 'jsdom'
import { setGlobal } from 'jest-util'
export { default as PROPEVENTS } from '../props/classes/PropEvents.js'
export { default as EVENTS } from '../props/classes/events.js'
const waitFor = check => {
  return new Promise((resolve, reject) => {
    if (check instanceof Function) {
      const timedCheck = () => {
        setTimeout(() => {
          if (check()) return resolve()
          timedCheck()
        }, 20)
      }
      timedCheck()
    } else if (!isNaN(check)) {
      setTimeout(resolve, check)
    }
  })
}
let container = null
// const { window } = new JSDOM()
// const { document } = window
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div')
  document.body.appendChild(container)
})
it('React render value', async () => {
  const model = new OBJECT({
    name: 'Paul',
    details: {
      age: 21
    }
  })

  render(
    <ObjectAge model={model}/>,
    container
  )
  // console.log(container)
  // expect(container.textContent).toBe('Paul 21')
  // const tree = component.toJSON()
  // expect(tree.children[0]).toBe('Paul')
  // expect(tree.children[2]).toBe('21')
  await waitFor(1000)
  // act(() => {
  //   model.details.age = 22
  // })
  // await waitFor(1000)
  // // await waitFor(() => {
  // //   const newtree = component.toJSON()
  // //   return newtree.children[2] === '22'
  // // })
  // const newtree = component.toJSON()
  // expect(newtree.children[2]).toBe('22')
  // console.log(newtree)
})
