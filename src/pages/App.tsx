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
  addTipe,
  migrate
} from '../redux/librarySlice'
import {
  selectView,
  LoadingStatus,
  ConnectedStatus,
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
  bottom: 0;
`
const Logout = styled.button`
  position: fixed;
  bottom: 0;
  left: 96px;
`
const Dark = styled.button`
  position: fixed;
  bottom: 0;
  left: 48px;
`

function App () {
  const dispatch = useDispatch()
  const view = useSelector(selectView)

  const loadFullData = async (entries: any, observer: any) => {
    if (view.loadingStatus !== (LoadingStatus.loaded || LoadingStatus.migrating)) {
      entries.forEach(async (entry: any) => {
        if (entry.intersectionRatio > 0) {
          const prevDistanceFromBottom = document.body.scrollHeight - window.pageYOffset
          await loadEveryTipesFromFirebase(dispatch)
          console.log('load full data')
          window.scrollTo(0, document.body.scrollHeight - prevDistanceFromBottom)
          dispatch(loadFromFirebase())
          console.log('loading from firebase')
          if (view.connectedStatus !== ConnectedStatus.disconnected) {
            dispatch(setLoadingStatus(LoadingStatus.loaded))
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
    if (view.connectedStatus !== ConnectedStatus.disconnected && view.loadingStatus !== LoadingStatus.migrating) {
      await loadFirstTipesFromFirebase(dispatch)
      dispatch(setLoadingStatus(LoadingStatus.firstDataLoaded))
      const observer = new IntersectionObserver(loadFullData, options)
      const target = document.querySelector('#loading-message')
      observer.observe(target as any)
    }
  }

  const connectedRef = firebase.database().ref('.info/connected')
  connectedRef.on('value', function (snap) {
    if (snap.val() === true) {
      dispatch(setConnectedStatus(ConnectedStatus.connected))
      if (view.loadingStatus === LoadingStatus.loading) {
        loadData()
      }
    } else {
      dispatch(setConnectedStatus(ConnectedStatus.disconnected))
    }
  })
  useEffect(() => {
    const newTipe = newTipeState()
    dispatch(addTipe(newTipe))
  }, [])

  const [isDark, setIsDark] = useState<boolean>(true)

  const onLogin = async () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    const result = await firebase.auth().signInWithPopup(provider)
    if (result.credential != null) {
      const user = result.user
      console.log(user)
      if (user != null) {
        const doc = await firestore.collection('users').doc(user.uid).get()
        if (doc.exists && doc.data()?.migrated !== true) {
          console.log('Needs migration')
          dispatch(setLoadingStatus(LoadingStatus.migrating))
          await migrate(doc, dispatch)
          await firestore.collection('users').doc(user.uid).set({ migrated: true }, { merge: true })
          dispatch(setLoadingStatus(LoadingStatus.loaded))
        }
      }
    }
  }
  const onLogout = () => {
    firebase.auth().signOut()
  }

  return (
    <Router>
      <ThemeProvider theme={isDark ? dark : light}>
        <AppRoot>
          <Login onClick={onLogin}>Login</Login>
          <Logout onClick={onLogout}>Logout</Logout>
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
