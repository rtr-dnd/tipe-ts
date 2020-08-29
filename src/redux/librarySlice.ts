import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'
import { RootState } from './store'
import { v4 as uuidv4 } from 'uuid'

import * as firebase from 'firebase'
import { firebaseProject, firestore } from '../firebase'

interface TipeState {
    id: string,
    is: 'tipe',
    title: string | undefined,
    text: string,
    createDate: number | undefined,
    editDate: number | undefined,
    thread: string | null,
}

function newTipeState () : TipeState {
  return {
    id: uuidv4(),
    is: 'tipe',
    title: '',
    text: '',
    createDate: new Date().getTime(),
    editDate: new Date().getTime(),
    thread: null
  }
}

interface ThreadState {
  id: string,
  is: 'thread',
  title: string | undefined,
  children: Array<string>
}

function newThreadState (parent: string) : ThreadState {
  return {
    id: uuidv4(),
    is: 'thread',
    title: '',
    children: [parent]
  }
}

interface LibraryState {
  tipes: Array<TipeState>,
  threads: Array<ThreadState>
}

const initialLibraryState: LibraryState = {
  tipes: [],
  threads: []
}

interface indexPayload {
  index: number,
  value: string
}

export const librarySlice = createSlice({
  name: 'library',
  initialState: initialLibraryState,
  reducers: {
    addTipe: (state) => {
      // 新しい要素を先頭に追加していく
      state.tipes.unshift(newTipeState())
    },
    loadTipe: (state, action: PayloadAction<TipeState>) => {
      // Firebaseの同期用 古い要素を後ろに追加していく すでにあるならアップデート
      const tmp = state.tipes.findIndex((element) => element.id === action.payload.id)
      if (tmp !== -1) {
        state.tipes[tmp] = action.payload
      } else {
        state.tipes.push(action.payload)
      }
    },
    removeTipe: (state, action: PayloadAction<number>) => {
      state.tipes.splice(action.payload, 1)
    },
    editTextOfTipe: (state, action: PayloadAction<indexPayload>) => {
      state.tipes[action.payload.index].text = action.payload.value
      state.tipes[action.payload.index].editDate = new Date().getTime()
    },
    editTitleOfTipe: (state, action: PayloadAction<indexPayload>) => {
      state.tipes[action.payload.index].title = action.payload.value
      state.tipes[action.payload.index].editDate = new Date().getTime()
    },
    editThreadOfTipe: (state, action: PayloadAction<indexPayload>) => {
      state.tipes[action.payload.index].thread = action.payload.value
    },
    createThread: (state, action: PayloadAction<number>) => {
      if (!state.tipes[action.payload].thread) {
        const currentThread = newThreadState(state.tipes[action.payload].id)
        state.threads.push(currentThread)
        state.tipes[action.payload].thread = currentThread.id
      }
    }
  }
})

export const {
  addTipe,
  loadTipe,
  removeTipe,
  editTextOfTipe,
  editTitleOfTipe,
  editThreadOfTipe,
  createThread
} = librarySlice.actions
export const selectLibrary = (state: RootState) => state.library

export const loadTipeFromFirebase = () => {
  return (dispatch: Dispatch<any>) => {
    firestore.collection('ver2users').doc('sZYKVb4GeOBrj69E28sB').collection('tipes')
      .where('is', '==', 'tipe')
      .orderBy('createDate', 'desc')
      .limit(5)
      .onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach(change => {
          if (change.type !== 'removed') {
            dispatch(loadTipe(change.doc.data() as any))
          }
        })
      })
    /*
    firestore.collection('ver2users').doc('sZYKVb4GeOBrj69E28sB').collection('tipes').doc('meta')
      .get().then((meta) => {
        // eslint-disable-next-line no-unused-expressions
        meta.data()?.structure.slice().reverse().forEach((structureName: string, structureIndex: number) => {
          // ↑structureは古いものが先頭に並んでいるので、逆にして新しいものから読み込み
          firestore.collection('ver2users').doc('sZYKVb4GeOBrj69E28sB').collection('tipes')
            .doc(structureName).onSnapshot((thisTipe) => {
              thisTipe.docChanges()
              dispatch(loadTipe(thisTipe.data() as any))
            })
        })
      })
      */
  }
}
export const pushTipeToFirebase = (index: number) => {
  return (dispatch: Dispatch<any>, getState: ()=>{library: LibraryState}) => {
    const stateBefore = getState()
    firestore.collection('ver2users').doc('sZYKVb4GeOBrj69E28sB').collection('tipes')
      .doc(stateBefore.library.tipes[index].id)
      .set(Object.assign({}, stateBefore.library.tipes[index]), { merge: true })
  }
}
export const removeTipeFromFirebase = (id: string) => {
  return () => {
    firestore.collection('ver2users').doc('sZYKVb4GeOBrj69E28sB').collection('tipes')
      .doc(id).delete()
  }
}

export default librarySlice.reducer
