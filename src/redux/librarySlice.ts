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
    title: string,
    text: string,
    createDate: number,
    editDate: number,
    lastSessionId: string,
    thread: string | null,
}

export function newTipeState () : TipeState {
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
  title: string,
  children: Array<string>,
  createDate: number,
  editDate: number,
  lastSessionId: string
}

export function newThreadState (parent: string) : ThreadState {
  return {
    id: uuidv4(),
    is: 'thread',
    title: '',
    children: [parent],
    createDate: new Date().getTime(),
    editDate: new Date().getTime(),
    lastSessionId: ''
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

interface threadPayload {
  threadIndex: number,
  childIndex: number,
  value: string
}

export const librarySlice = createSlice({
  name: 'library',
  initialState: initialLibraryState(),
  reducers: {
    addTipe: (state, action: PayloadAction<TipeState>) => {
      // 既存要素を先頭に追加していく
      if (action && action.payload) {
        state.tipes.unshift(action.payload)
        state.tipes[0].lastSessionId = state.sessionId
      }
    },
    loadTipe: (state, action: PayloadAction<TipeState>) => {
      // Firebaseの同期用 古い要素を後ろに追加していく すでにあるならアップデート
      const tmp = state.tipes.findIndex((element) => element.id === action.payload.id)
      if (tmp !== -1) {
        if (action.payload.editDate >= state.tipes[tmp].editDate) {
          state.tipes[tmp] = action.payload
        } else { }
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
    addThread: (state, action: PayloadAction<ThreadState>) => {
      // 注意：Tipesと同様threadsも新しいものが先頭になるようにする
      if (action && action.payload) {
        state.threads.unshift(action.payload)
        state.threads[0].lastSessionId = state.sessionId
      }
    },
    loadThread: (state, action: PayloadAction<ThreadState>) => {
      // Firebaseの同期用 古い要素を後ろに追加していく すでにあるならアップデート
      const tmp = state.threads.findIndex((element) => element.id === action.payload.id)
      if (tmp !== -1) {
        if (action.payload.editDate >= state.threads[tmp].editDate) {
          state.threads[tmp] = action.payload
        } else { }
      } else {
        state.threads.push(action.payload)
      }
    },
    refreshSessionIdOfThread: (state, action: PayloadAction<number>) => {
      state.threads[action.payload].lastSessionId = state.sessionId
    },
    removeThread: (state, action: PayloadAction<number>) => {
      state.threads.splice(action.payload, 1)
    },
    addTipeToThread: (state, action: PayloadAction<threadPayload>) => {
      // 注意：Tipesと同様threadsのchildrenも新しいものが先頭になるようにする
      state.threads[action.payload.threadIndex].children.splice(action.payload.childIndex, 0, action.payload.value)
      state.threads[action.payload.threadIndex].editDate = new Date().getTime()
      state.threads[action.payload.threadIndex].lastSessionId = state.sessionId
    },
    removeTipeFromThread: (state, action: PayloadAction<threadPayload>) => {
      state.threads[action.payload.threadIndex].children.splice(action.payload.childIndex, 1)
      state.threads[action.payload.threadIndex].editDate = new Date().getTime()
      state.threads[action.payload.threadIndex].lastSessionId = state.sessionId
    }
  }
})

export const {
  addTipe,
  loadTipe,
  refreshSessionIdOfTipe,
  removeTipe,
  editTextOfTipe,
  editTitleOfTipe,
  editThreadOfTipe,

  addThread,
  loadThread,
  refreshSessionIdOfThread,
  removeThread,
  addTipeToThread,
  removeTipeFromThread
} = librarySlice.actions
export const selectLibrary = (state: RootState) => state.library

export const loadFirstTipesFromFirebase = async (dispatch: Dispatch<any>) => {
  return new Promise((resolve) => {
    firestore.collection('ver2users').doc('sZYKVb4GeOBrj69E28sB').collection('tipes')
      .where('is', '==', 'tipe')
      .orderBy('createDate', 'desc')
      .limit(5)
      .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          dispatch(loadTipe(doc.data() as TipeState))
        })
      }).then(() => {
        window.scrollTo(0, document.body.scrollHeight)
        resolve()
      })
  })
}
export const loadEveryTipesFromFirebase = async (dispatch: Dispatch<any>) => {
  return new Promise((resolve) => {
    firestore.collection('ver2users').doc('sZYKVb4GeOBrj69E28sB').collection('tipes')
      .where('is', '==', 'tipe')
      .orderBy('createDate', 'desc')
      .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          dispatch(loadTipe(doc.data() as TipeState))
        })
      }).then(() => {
        resolve()
      })
  })
}

export const loadFromFirebase = () => {
  return (dispatch: Dispatch<any>, getState: () => {library: LibraryState}) => {
    firestore.collection('ver2users').doc('sZYKVb4GeOBrj69E28sB').collection('tipes')
      .where('is', '==', 'tipe')
      .orderBy('createDate', 'desc')
      // .limit(5)
      .onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach(change => {
          const library = getState().library
          if (change.type !== 'removed') {
            if (change.type === 'added') {
              // 初回にFirebaseから読み込んでる or 他の端末で要素が増えたのを同期してる or 自分が編集でemitしたものが戻ってきた
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
          } else {
            dispatch(removeTipe(library.tipes.findIndex((element) => { return element.id === change.doc.data().id })))
          }
        })
      })
    firestore.collection('ver2users').doc('sZYKVb4GeOBrj69E28sB').collection('threads')
      .where('is', '==', 'thread')
      .orderBy('createDate', 'desc')
      // .limit(5)
      .onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach(change => {
          const library = getState().library
          if (change.type !== 'removed') {
            if (change.type === 'added') {
              if (change.doc.data().editDate > library.sessionBeginDate &&
              change.doc.data().lastSessionId !== library.sessionId) {
                // 別端末で追加された要素
                dispatch(addThread(change.doc.data() as ThreadState))
              } else {
                // ただ読み込んでるだけ
                dispatch(loadThread(change.doc.data() as ThreadState))
              }
            } else {
              dispatch(loadThread(change.doc.data() as ThreadState))
            }
            const tmp = library.threads.findIndex((element) => element.id === change.doc.data().id)
            if (tmp !== -1) {
              setTimeout(() => {
                dispatch(refreshSessionIdOfThread(tmp))
              }, 500)
            }
          } else {
            dispatch(removeThread(library.threads.findIndex((element) => { return element.id === change.doc.data().id })))
          }
        })
      })
    console.log('load from firebase')
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
export const pushThreadToFirebase = (index: number) => {
  return (dispatch: Dispatch<any>, getState: ()=>{library: LibraryState}) => {
    const stateBefore = getState()
    firestore.collection('ver2users').doc('sZYKVb4GeOBrj69E28sB').collection('threads')
      .doc(stateBefore.library.threads[index].id)
      .set(Object.assign({}, stateBefore.library.threads[index]), { merge: true })
  }
}
export const removeThreadFromFirebase = (id: string) => {
  return () => {
    firestore.collection('ver2users').doc('sZYKVb4GeOBrj69E28sB').collection('threads')
      .doc(id).delete()
  }
}

export default librarySlice.reducer
