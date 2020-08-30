// eslint-disable-next-line
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// eslint-disable-next-line
import { Dispatch } from 'redux'
// eslint-disable-next-line
import { RootState } from './store'
import { v4 as uuidv4 } from 'uuid'

import { firestore } from '../firebase'

interface TipeState {
    id: string,
    is: 'tipe',
    title: string | undefined,
    text: string,
    createDate: number | undefined,
    editDate: number | undefined,
    lastSessionId: string,
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
    lastSessionId: '',
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
  sessionId: string,
  sessionBeginDate: number,
  tipes: Array<TipeState>,
  threads: Array<ThreadState>
}

function initialLibraryState () : LibraryState {
  return {
    sessionId: uuidv4(),
    sessionBeginDate: new Date().getTime(),
    tipes: [],
    threads: []
  }
}

interface indexPayload {
  index: number,
  value: string
}

export const librarySlice = createSlice({
  name: 'library',
  initialState: initialLibraryState(),
  reducers: {
    addTipe: (state, action: PayloadAction<TipeState>) => {
      // 既存要素を先頭に追加していく (別端末で新しく要素を作成した場合)
      if (action && action.payload) {
        state.tipes.unshift(action.payload)
      }
    },
    addNewTipe: (state) => {
      // 新しい要素を先頭に追加していく（この端末で新しく要素を作成した場合）
      state.tipes.unshift(newTipeState())
    },
    loadTipe: (state, action: PayloadAction<TipeState>) => {
      // Firebaseの同期用 古い要素を後ろに追加していく すでにあるならアップデート
      const tmp = state.tipes.findIndex((element) => element.id === action.payload.id)
      if (tmp !== -1) {
        if (action.payload.editDate !== state.tipes[tmp].editDate) {
          state.tipes[tmp] = action.payload
        }
      } else {
        state.tipes.push(action.payload)
      }
    },
    refreshSessionIdOfTipe: (state, action: PayloadAction<number>) => {
      state.tipes[action.payload].lastSessionId = state.sessionId
    },
    removeTipe: (state, action: PayloadAction<number>) => {
      state.tipes.splice(action.payload, 1)
    },
    editTextOfTipe: (state, action: PayloadAction<indexPayload>) => {
      state.tipes[action.payload.index].text = action.payload.value
      state.tipes[action.payload.index].editDate = new Date().getTime()
      state.tipes[action.payload.index].lastSessionId = state.sessionId
    },
    editTitleOfTipe: (state, action: PayloadAction<indexPayload>) => {
      state.tipes[action.payload.index].title = action.payload.value
      state.tipes[action.payload.index].editDate = new Date().getTime()
      state.tipes[action.payload.index].lastSessionId = state.sessionId
    },
    editThreadOfTipe: (state, action: PayloadAction<indexPayload>) => {
      state.tipes[action.payload.index].thread = action.payload.value
      state.tipes[action.payload.index].editDate = new Date().getTime()
      state.tipes[action.payload.index].lastSessionId = state.sessionId
    },
    createThread: (state, action: PayloadAction<number>) => {
      if (!state.tipes[action.payload].thread) {
        const currentThread = newThreadState(state.tipes[action.payload].id)
        state.threads.push(currentThread)
        state.tipes[action.payload].thread = currentThread.id
        state.tipes[action.payload].lastSessionId = state.sessionId
      }
    }
  }
})

export const {
  addTipe,
  addNewTipe,
  loadTipe,
  refreshSessionIdOfTipe,
  removeTipe,
  editTextOfTipe,
  editTitleOfTipe,
  editThreadOfTipe,
  createThread
} = librarySlice.actions
export const selectLibrary = (state: RootState) => state.library

export const loadTipeFromFirebase = () => {
  return (dispatch: Dispatch<any>, getState: () => {library: LibraryState}) => {
    firestore.collection('ver2users').doc('sZYKVb4GeOBrj69E28sB').collection('tipes')
      .where('is', '==', 'tipe')
      .orderBy('createDate', 'desc')
      .limit(5)
      .onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach(change => {
          if (change.type !== 'removed') {
            const library = getState().library
            if (change.type === 'added') {
              if (change.doc.data().editDate > library.sessionBeginDate &&
              change.doc.data().lastSessionId !== library.sessionId) {
                // 別端末で追加された要素
                dispatch(addTipe(change.doc.data() as TipeState))
              } else {
                // ただ読み込んでるだけ
                dispatch(loadTipe(change.doc.data() as TipeState))
              }
            } else {
              dispatch(loadTipe(change.doc.data() as TipeState))
            }
            const tmp = library.tipes.findIndex((element) => element.id === change.doc.data().id)
            if (tmp !== -1) {
              setTimeout(() => {
                dispatch(refreshSessionIdOfTipe(tmp))
              }, 500)
            }
          }
        })
      })
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
