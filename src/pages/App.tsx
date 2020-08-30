import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'

import { light, dark } from '../assets/colors'
import Header from '../components/Header'
import IndexPage from './IndexPage'
import ThreadPage from './ThreadPage'

import * as firebase from 'firebase'
import { firebaseProject, firestore } from '../firebase'

const AppRoot = styled.div`
  background-color: ${props => props.theme.background};
  transition: 0.5s;
`

const Content = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`
const Login = styled.button`
  position: fixed;
`
const Dark = styled.button`
  position: fixed;
  left: 48px;
`

function App () {
  const [isDark, setIsDark] = useState<boolean>(false)

  useEffect(() => {
    console.log(firebaseProject.name)
  }, [])

  const onLogin = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider).then((result) => {
      if (result.credential != null) {
        const user = result.user
        console.log(user)
        if (user != null) {
          firestore.collection('users').doc(user.uid).get().then((doc) => {
            if (doc !== undefined) {
              console.log(doc.data())
            }
          })
        }
      }
    })
  }

  return (
    <Router>
      <ThemeProvider theme={isDark ? dark : light}>
        <AppRoot>
          <Header />
          <Login onClick={onLogin}>Login</Login>
          <Dark onClick={() => {
            setIsDark(!isDark)
            document.body.classList.toggle('dark')
          }}>Dark</Dark>
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
        </AppRoot>
      </ThemeProvider>
    </Router>
  )
}

export default App
