import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDrZeNpMEIMsS7jo2IHg93-gUBOBQnh2gg',
  authDomain: 'tipe-it.firebaseapp.com',
  databaseURL: 'https://tipe-it.firebaseio.com',
  projectId: 'tipe-it',
  storageBucket: 'tipe-it.appspot.com',
  messagingSenderId: '151138394945',
  appId: '1:151138394945:web:c87a588b9c9fcc10'
}

export const firebaseProject = firebase.initializeApp(firebaseConfig)
export const firestore = firebase.firestore()
export const auth = firebase.auth()
