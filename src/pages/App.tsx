import IntersectionObserver from 'intersection-observer'

import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation
} from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import styled, { ThemeProvider } from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { light, dark } from '../assets/colors'
import Header from '../components/Header'
import IndexPage from './IndexPage'
import ThreadPage from './ThreadPage'

import { loadFirstTipesFromFirebase, loadEveryTipesFromFirebase, loadFromFirebase } from '../redux/librarySlice'
import {
  selectView,
  setStatus
} from '../redux/viewSlice'
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
  const dispatch = useDispatch()
  const view = useSelector(selectView)

  const loadFullData = async (entries: any, observer: any) => {
    entries.forEach(async (entry: any) => {
      if (entry.intersectionRatio > 0) {
        const prevDistanceFromBottom = document.body.scrollHeight - window.pageYOffset
        await loadEveryTipesFromFirebase(dispatch)
        window.scrollTo(0, document.body.scrollHeight - prevDistanceFromBottom)
        dispatch(loadFromFirebase())
        if (view.status !== 'disconnected') {
          dispatch(setStatus('loaded'))
        }
      }
    })
  }

  const loadData = async () => {
    const options = {
      rootMargin: '0px',
      threshold: 1
    }
    if (view.status !== 'disconnected') {
      await loadFirstTipesFromFirebase(dispatch)
      dispatch(setStatus('first data loaded'))
      const observer = new IntersectionObserver(loadFullData, options)
      const target = document.querySelector('#loading-message')
      observer.observe(target as any)
    }
  }

  firebase.auth().onAuthStateChanged((user) => {
    console.log(user?.uid)
  })
  const connectedRef = firebase.database().ref('.info/connected')
  connectedRef.on('value', function (snap) {
    if (snap.val() === true) {
      console.log('connected')
      dispatch(setStatus('connected'))
      loadData()
    } else {
      console.log('disconnected')
      dispatch(setStatus('disconnected'))
    }
  })
  useEffect(() => {
    loadData()
    console.log('loading data')
  }, [])

  const [isDark, setIsDark] = useState<boolean>(true)

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
