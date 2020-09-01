import React, { useState } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation
} from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import styled, { ThemeProvider } from 'styled-components'

import { light, dark } from '../assets/colors'
import Header from '../components/Header'
import IndexPage from './IndexPage'
import ThreadPage from './ThreadPage'

import * as firebase from 'firebase'
import { firestore } from '../firebase'

const AppRoot = styled.div`
  background-color: ${props => props.theme.background};
  transition: 0.5s;
`

const Content = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  .fade-enter {
      opacity: 0.01;
  }
  .fade-enter.fade-enter-active {
      opacity: 1;
      transition: opacity 300ms ease-in;
  }
  .fade-exit {
      opacity: 1;
  }
    
  .fade-exit.fade-exit-active {
      opacity: 0.01;
      transition: opacity 500ms ease-in;
  }
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
          <AnimatedApp />
        </AppRoot>
      </ThemeProvider>
    </Router>
  )
}

export default App

function AnimatedApp () {
  const location = useLocation()

  return (
    <Content>
      <TransitionGroup>
        <CSSTransition
          key={location.key}
          timeout={{ enter: 300, exit: 300 }}
          classNames={'fade'}
        >
          <Switch location={location}>
            <Route path='/thread/:threadId'>
              <ThreadPage />
            </Route>
            <Route path='/about'></Route>
            <Route path='/get-started'></Route>
            <Route exact path='/'>
              <IndexPage />
            </Route>
          </Switch>
        </CSSTransition>
      </TransitionGroup>
    </Content>
  )
}
