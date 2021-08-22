/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/**
 * @jest-environment jsdom
 */

import OBJECT from '../props/Object.js'
// eslint-disable-next-line no-unused-vars
import React from 'react'
import { render } from 'react-dom'
// eslint-disable-next-line no-unused-vars
import ObjectAge from './components/ObjectAge.js'
import { act } from 'react-dom/test-utils'
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
  expect(container.textContent).toBe('Paul21')
  const childrenContent = [].slice.call(container.children).map(e => e.textContent)
  expect(childrenContent[0]).toBe('Paul')
  expect(childrenContent[1]).toBe('21')
  await waitFor(1000)
  act(() => {
    model.details.age = 22
  })
  await waitFor(100)
  const newChildrenContent = [].slice.call(container.children).map(e => e.textContent)
  expect(newChildrenContent[1]).toBe('22')
})
