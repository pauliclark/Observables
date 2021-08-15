// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react'
import stateOnEffect from '../../props/react/stateOnEffect.js'

const ObjectAge = ({ model }) => {
  const age = stateOnEffect(model.details.age, { useState, useEffect })
  const name = stateOnEffect(model.name, { useState, useEffect })
  return (
    <strong>
      {name} {age}
    </strong>
  )
}

export default ObjectAge
