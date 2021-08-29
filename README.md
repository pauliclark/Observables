# Observabubble
A package of observable properties, objects and arrays

## Install

```
yarn add observabubble
```

## Primitive

For use as an Observable primitive

```
import {INTEGER, EVENTS} from 'observabubble'
const myInt = new INTEGER(3)
myInt.on(EVENTS.CHANGE, target => {
  console.log(target == 4)
})
myInt._set(4)
```

## Object

An Object is defined by a Schema which is assigned an Observable type to a key, as below.
The values can be assigned in the constructor, in the *values* parameter of the second argument.
As this is an Object, the Observable string *name* is exposed to that object and can therefore be assigned to.

```
import {OBJECT, STRING, INTEGER, EVENTS} from 'observabubble'
const myObject = new OBJECT(
  {
    name: STRING,
    age: INTEGER
  },{
    values:{
      name: 'Anna',
      age:20
    }
  }
)
myObject.name.on(EVENTS.CHANGE, target => {
  console.log(`Name has changed to ${target}`)
})
myObject.name = 'Harry'
```


## Objects extended

To create an custom version of an Object, the class can be extended.

```
import {OBJECT, INTEGER, STRING} from 'observabubble'
const schema = {
  id: INTEGER,
  name: STRING,
  age: INTEGER
}
class User extends OBJECT {
  constructor (values) {
    super(schema, { values })
  }
}
const anna = new User({
  id:1,
  name:'Anna',
  age: 20
})
console.log(`${anna.name} is ${anna.age} years old`)
```

## Objects referencing Objects

To allow for referencing Objects, the model store is needed for recording each model and for discovering the referenced model.

Define the *User* model:
```
import {OBJECT, INTEGER, STRING, REFERENCE, STORE, registerInStore} from 'observabubble'

class UserRef extends REFERENCE {
  constructor (id, { parent, name } = {}) {
    super({ User }, { id, parent, name })
  }
}

const schema = {
  id: INTEGER,
  name: STRING,
  address: STRING,
  friend: UserRef
}
class User extends OBJECT {
  constructor (values) {
    super(schema, { values })
    STORE.User.add([this])
  }
}
registerInStore({ User })

```

*UserRef* extends REFERENCE to tie an *id* to a User stored in *STORE*

The schema for the User model is then using this user reference type for the *friend* property.

In the constructor of the User, the new instance of the model is added to the STORE, with:
```
STORE.User.add([this])
```

The *registerInStore* method let's the STORE know which models it shall be using. Ensure the syntax is:
```
registerInStore({ User })
```
This is important for the name and model to be assigned together.

A REFERENCE type is asynchronous, as the referred model may not be available in the store yet. The REFERENCE will listen for it to be added, and once added, the REFERENCE will receive it and store in:
```
user.friend._ref
// or
user._friend
```

An example of how this may work:
```
import {EVENTS} from 'observabubble'
const {LOAD} = EVENTS
const model = new User({
  id: 1,
  name: 'Paul',
  friend: 2
})
model.friend.on(LOAD, () => {
  console.log(`${model._friend.name} should be Frank`)
  console.log(`${model.friend._ref.name} should be Frank`)
})
const model2 = new User({
  id: 2,
  name: 'Frank'
})
```

If the models are being created around the same time, a Promise on the model can be used:
```
import {EVENTS} from 'observabubble'
const {LOAD} = EVENTS
const model = new User({
  id: 1,
  name: 'Paul',
  friend: 2
})
model.friend.getRef().then(friend => {
  console.log(`${friend.name} should be Frank`)
})
const model2 = new User({
  id: 2,
  name: 'Frank'
})
```

## ARRAY

The Array observable exposes many native Array methods, but just wraps it an object for observing it.

When defined, the schema for the items is suggested. As with OBJECTS, the schema can be derived from the provided values, but this is not recommended. The provision of a Schema makes for more robust data.

### Without a Schema
```
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
console.log(`${data[0].name} should be Paul`)
```

### With a Schema

```
const model = new ARRAY(
  {
    name: STRING,
    age: INTEGER,
    today: DATE
  }, {
    values:[
      {
        name: 'John',
        age: 20,
        today: new Date()
      }
    ]
  }
)
const data = [...model]
console.log(`${data[0].name} should be Paul`)
```

### Watching

```
import {EVENTS, ARRAY, STRING, INTEGER, DATE } from 'observabubble'
const {CHANGE} = EVENTS
const people = new ARRAY(
  {
    name: STRING,
    age: INTEGER,
    today: DATE
  }, {
    values:[
      {
        name: 'John',
        age: 20,
        today: new Date()
      }
    ]
  }
)
people.on(CHANGE,target => {
  console.log(JSON.stringify(target,null,2))
})
people.push({
  name: 'Bobby',
  age: 30,
  today: new Date()
})
```