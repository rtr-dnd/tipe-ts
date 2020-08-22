import React, { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'

import Header from '../components/Header'
import IndexPage from './IndexPage'
import ThreadPage from './ThreadPage'
import { editTextOfTipe, selectLibrary } from '../redux/librarySlice'

const Content = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`

function App () {
  const library = useSelector(selectLibrary)
  const dispatch = useDispatch()

  useEffect(() => {
    console.log('app updated')
  })

  return (
    <Router>
      <div className="App">
        <Header />
        <Content>
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
        </Content>
      </div>
    </Router>
  )
}

export default App
