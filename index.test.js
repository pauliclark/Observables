export { default as  PROPEVENTS} from './props/classes/PropEvents.js'
export { default as  EVENTS} from './props/classes/events.js'
import OBJECT from './props/Object.js'

test('Compare model strings', () => {
  
  const model  = new OBJECT({
    name: 'Paul',
    age: 21,
    today: new Date()
  })
  const model2  = new OBJECT({
    name: 'Paul',
    age: 22,
    today: new Date()
  })
  console.log(model.name, model.name == 'Paul',  model.name.toString() == model2.name.toString())
  expect(model.name == 'Paul').toBe(true);
  expect(model.name.toString() == model2.name.toString()).toBe(true);
});