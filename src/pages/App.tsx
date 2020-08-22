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

import * as firebase from 'firebase'
import { firebaseProject, firestore } from '../firebase'

const Content = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`

function App () {
  const library = useSelector(selectLibrary)
  const dispatch = useDispatch()

  useEffect(() => {
    console.log(firebaseProject.name)
  }, [])

  const onLogin = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider).then((result) => {
      if (result.credential != null) {
        const credential = result.credential as firebase.auth.OAuthCredential
        const token = credential.accessToken
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
      <div className="App">
        <Header />
        <button onClick={onLogin}>Login</button>
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
