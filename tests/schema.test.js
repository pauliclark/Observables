/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
import schema from '../props/classes/schema.js'
import props from '../props/index.js'

test('Schema built using data values', () => {
  const [shape, values] = schema({
    name: 'Paul',
    age: 21,
    today: new Date(),
    friends: [{
      name: 'Paul',
      age: 21
    }]
  })

  expect(shape.name === props.String).toBe(true)
  expect(shape.age === props.Integer).toBe(true)
  expect(shape.today === props.Date).toBe(true)
  expect(values.name === 'Paul').toBe(true)
  expect(values.age === 21).toBe(true)
  // expect(shape.friends[0].name === props.String).toBe(true)
})
test('Schema built using nested object data values', () => {
  const [shape, values] = schema({
    name: 'Paul',
    age: 21,
    address: {
      houseNumber: 10,
      street: 'Downing Street'
    }
  })
  expect(shape.name === props.String).toBe(true)
  expect(shape.age === props.Integer).toBe(true)
  expect(shape.address.houseNumber === props.Integer).toBe(true)
  expect(values.name === 'Paul').toBe(true)
  expect(values.address.houseNumber === 10).toBe(true)
})

test('Schema built using data types', () => {
  const [shape] = schema({
    name: 'String',
    age: 'Integer',
    today: 'Date'
  })

  expect(shape.name === props.String).toBe(true)
  expect(shape.age === props.Integer).toBe(true)
  expect(shape.today === props.Date).toBe(true)
})
test('Schema built using data prop types', () => {
  const [shape] = schema({
    name: { type: 'String' },
    age: { type: 'Integer' },
    today: { type: 'Date' }
  })

  expect(shape.name === props.String).toBe(true)
  expect(shape.age === props.Integer).toBe(true)
  expect(shape.today === props.Date).toBe(true)
})
test('Schema built when sent a Schema', () => {
  const [shape] = schema({
    name: props.String,
    age: props.Integer,
    today: props.Date
  })

  expect(shape.name === props.String).toBe(true)
  expect(shape.age === props.Integer).toBe(true)
  expect(shape.today === props.Date).toBe(true)
})
