import React, { useState, useEffect, useRef } from 'react'
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

import {
  loadFirstTipesFromFirebase,
  loadEveryTipesFromFirebase,
  loadFromFirebase,
  newTipeState,
  addTipe
} from '../redux/librarySlice'
import {
  selectView,
  setLoadingStatus,
  setConnectedStatus
} from '../redux/viewSlice'
import * as firebase from 'firebase'
import { firestore } from '../firebase'

require('intersection-observer')

const AppRoot = styled.div`
  background-color: ${props => props.theme.background};
  transition: 0.5s;
`

const Content = styled.div`
  .fade-enter {
      opacity: 0;
  }
  .fade-enter-active {
      opacity: 1;
      transition: opacity 300ms ease-in;
  }
  .fade-exit {
      opacity: 1;
  }
    
  .fade-exit-active {
      opacity: 0;
      transition: opacity 10ms;
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
    if (view.loadingStatus !== 'loaded') {
      entries.forEach(async (entry: any) => {
        if (entry.intersectionRatio > 0) {
          const prevDistanceFromBottom = document.body.scrollHeight - window.pageYOffset
          await loadEveryTipesFromFirebase(dispatch)
          console.log('load full data')
          window.scrollTo(0, document.body.scrollHeight - prevDistanceFromBottom)
          dispatch(loadFromFirebase())
          console.log('loading from firebase')
          if (view.connectedStatus !== 'disconnected') {
            dispatch(setLoadingStatus('loaded'))
          }
        }
      })
    }
  }

  const loadData = async () => {
    const options = {
      rootMargin: '0px',
      threshold: 1
    }
    if (view.connectedStatus !== 'disconnected') {
      await loadFirstTipesFromFirebase(dispatch)
      dispatch(setLoadingStatus('first data loaded'))
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
      dispatch(setConnectedStatus('connected'))
      if (view.loadingStatus === 'loading') {
        loadData()
      }
    } else {
      console.log('disconnected')
      dispatch(setConnectedStatus('disconnected'))
    }
  })
  useEffect(() => {
    console.log('loading data')
    const newTipe = newTipeState()
    dispatch(addTipe(newTipe))
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
  const nodeRef = useRef(null)

  const routes = [
    { path: '/', name: 'Home', Component: IndexPage },
    { path: '/thread/:threadId', name: 'Thread', Component: ThreadPage }
  ]

  return (
    <Content>
      {routes.map(({ path, Component }) => (
        <Route
          key={path}
          exact
          path={path} >
          {({ match }) => (
            <CSSTransition
              in={match != null}
              timeout={0}
              classNames={'fade'}
              nodeRef={nodeRef}
              unmountOnExit>
              <div ref={nodeRef}>
                <Header />
                <Component />
              </div>
            </CSSTransition>
          )}
        </Route>
      ))}
      {/* <TransitionGroup>
        <CSSTransition
          key={location.key}
          nodeRef={nodeRef}
          timeout={{ enter: 300, exit: 300 }}
          classNames={'fade'}
          unmountOnExit
        >
          <Switch location={location}>
            <Route path='/thread/:threadId'>
              <div ref={nodeRef}>
                <Header />
                <ThreadPage />
              </div>
            </Route>
            <Route path='/about'></Route>
            <Route path='/get-started'></Route>
            <Route exact path='/'>
              <div ref={nodeRef}>
                <Header />
                <IndexPage />
              </div>
            </Route>
          </Switch>
        </CSSTransition>
      </TransitionGroup> */}
    </Content>
  )
}
