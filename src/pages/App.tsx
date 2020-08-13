import React, { useState } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'

import Button from '../components/Button'
import IndexPage from './IndexPage'
import ThreadPage from './ThreadPage'
import { edit, selectText } from '../redux/slice'

const MessageBox = styled.div<{danger: boolean}>`
  background-color: ${props => props.danger ? '#f00' : '#0f0'}
`

function App () {
  const [activeMessage, setActiveMessage] = useState<String>('')
  const [parentIsActive, setParentIsActive] = useState<boolean>(false)

  const text = useSelector(selectText)
  const dispatch = useDispatch()

  const updateIsActive = (isActive: boolean) => {
    setParentIsActive(isActive)
    setActiveMessage(parentIsActive
      ? 'this is pressed'
      : 'this is not pressed')
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <MessageBox danger={parentIsActive}>{activeMessage}</MessageBox>
          <Button message="first" updateIsActive={updateIsActive}></Button>
          <p>{text.value}</p>
          <p>{text.date}</p>
          <button onClick={() => dispatch(edit('updated!'))}>change message</button>
        </header>
        <Switch>
          <Route path='/thread'>
            <ThreadPage />
          </Route>
          <Route path='/about'></Route>
          <Route path='/get-started'></Route>
          <Route path='/'>
            <IndexPage />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default App
