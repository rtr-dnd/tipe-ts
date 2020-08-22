import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCeP6T-KW3MOdmDFQls03MPm3fL0Z0a23c',
  authDomain: 'develop-tipe-it.firebaseapp.com',
  databaseURL: 'https://develop-tipe-it.firebaseio.com',
  projectId: 'develop-tipe-it',
  storageBucket: 'develop-tipe-it.appspot.com',
  messagingSenderId: '6883769585',
  appId: '1:6883769585:web:077aacf3eb72a1a5'
}

export const firebaseProject = firebase.initializeApp(firebaseConfig)
export const firestore = firebase.firestore()
