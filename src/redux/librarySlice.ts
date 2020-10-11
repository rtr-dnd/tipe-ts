// eslint-disable-next-line
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// eslint-disable-next-line
import { Dispatch } from 'redux'
// eslint-disable-next-line
import { RootState } from './store'
import { v4 as uuidv4 } from 'uuid'

import * as firebase from 'firebase'
import { firestore } from '../firebase'
import { LoadingStatus, setLoadingStatus } from './viewSlice'

let user: string | undefined
let doc: firebase.firestore.DocumentReference
firebase.auth().onAuthStateChanged((thisUser) => {
  console.log('in library: ' + thisUser?.uid)
  if (thisUser) {
    user = thisUser?.uid
  } else {
    user = 'temp-' + uuidv4()
  }
  doc = firestore.collection('ver2users').doc(user)
})

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

export function newThreadState () : ThreadState {
  return {
    id: uuidv4(),
    is: 'thread',
    title: '',
    children: [],
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
  childIndexInThread: number,
  childIndexInTipes: number,
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
    loadTipeToHead: (state, action: PayloadAction<TipeState>) => {
      const tmp = state.tipes.findIndex((element) => element.id === action.payload.id)
      if (tmp !== -1) {
        if (action.payload.editDate >= state.tipes[tmp].editDate) {
          state.tipes[tmp] = action.payload
        } else { }
      } else {
        state.tipes.unshift(action.payload)
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
      if (state.tipes[action.payload]) { state.tipes[action.payload].lastSessionId = state.sessionId }
    },
    removeTipe: (state, action: PayloadAction<number>) => {
      const thisTipe = state.tipes[action.payload]
      if (thisTipe && thisTipe.thread) {
        const thisThread = state.threads.find((element) => { return element.id === thisTipe.thread })
        if (thisThread) {
          thisThread.children.splice(thisThread.children.indexOf(thisTipe.id), 1)
          if (thisThread.children.length === 0) {
            removeThreadFromFirebase(thisThread.id)
            state.threads.splice(state.threads.indexOf(thisThread), 1)
          }
        }
      }
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
    editThreadOfTipe: (state, action: PayloadAction<indexPayload>) => { // todo: これは混乱するのでaddTipeToThreadに統一
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
      const thisThread = state.threads[action.payload]
      state.tipes.forEach(element => {
        if (element.thread === thisThread.id) {
          element.thread = null
        }
      })
      state.threads.splice(action.payload, 1)
    },
    addTipeToThread: (state, action: PayloadAction<threadPayload>) => {
      // 追加するTipeの編集
      state.tipes[action.payload.childIndexInTipes].thread = state.threads[action.payload.threadIndex].id
      state.tipes[action.payload.childIndexInTipes].editDate = new Date().getTime()
      state.tipes[action.payload.childIndexInTipes].lastSessionId = state.sessionId
      // 注意：Tipesと同様threadsのchildrenも新しいものが先頭になるようにする
      state.threads[action.payload.threadIndex].children.splice(action.payload.childIndexInThread, 0, action.payload.value)
      state.threads[action.payload.threadIndex].editDate = new Date().getTime()
      state.threads[action.payload.threadIndex].lastSessionId = state.sessionId
    },
    removeTipeFromThread: (state, action: PayloadAction<threadPayload>) => {
      state.threads[action.payload.threadIndex].children.splice(action.payload.childIndexInThread, 1)
      state.threads[action.payload.threadIndex].editDate = new Date().getTime()
      state.threads[action.payload.threadIndex].lastSessionId = state.sessionId
    },
    editTitleOfThread: (state, action: PayloadAction<indexPayload>) => {
      state.threads[action.payload.index].title = action.payload.value
      state.threads[action.payload.index].editDate = new Date().getTime()
      state.threads[action.payload.index].lastSessionId = state.sessionId
    }
  }
})

export const {
  addTipe,
  loadTipeToHead,
  loadTipe,
  refreshSessionIdOfTipe,
  removeTipe,
  editTextOfTipe,
  editTitleOfTipe,
  // editThreadOfTipe,

  addThread,
  loadThread,
  refreshSessionIdOfThread,
  removeThread,
  addTipeToThread,
  removeTipeFromThread,
  editTitleOfThread
} = librarySlice.actions
export const selectLibrary = (state: RootState) => state.library

export const loadThreadsFromFirebase = () => {
  return (dispatch: Dispatch<any>, getState: () => {library: LibraryState}) => {
    return new Promise((resolve) => {
      doc.collection('threads')
        .where('is', '==', 'thread')
        .orderBy('editDate', 'desc')
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
              if (change.doc.data().isRemoving) {
                dispatch(removeThread(library.threads.findIndex((element) => { return element.id === change.doc.data().id })))
              }
            }
          })
          console.log('threads loaded')
          resolve()
        })
    })
  }
}

export const loadTipesIncrementallyFromFirebase = () => {
  return (dispatch: Dispatch<any>, getState: () => {library: LibraryState}) => {
    return new Promise((resolve) => {
      if (!doc) return
      const library = getState().library
      const index = doc.collection('tipes')
        .where('is', '==', 'tipe')
        .orderBy('createDate', 'desc')
        .startAfter(library.tipes[library.tipes.length - 1].createDate)
        .limit(5)

      index.get().then((querySnapshot) => {
        querySnapshot.docs.forEach((qds) => {
          // qds: QueryDocumentSnapshotだが今回限りなので毎回変わったりはしない
          qds.ref.onSnapshot({
            next: (newDoc) => {
              const library = getState().library
              const newDocData = newDoc.data()
              if (newDoc.exists && newDocData !== undefined) {
                // 追加or編集された
                if (newDocData.editDate > library.sessionBeginDate &&
                    newDocData.lastSessionId !== library.sessionId) {
                  // 別端末で追加された要素
                  dispatch(loadTipeToHead(newDocData as TipeState))
                } else {
                  // ただ読み込んでるだけ
                  dispatch(loadTipe(newDocData as TipeState))
                }
                const tmp = library.tipes.findIndex((element) => element.id === newDocData.id)
                if (tmp !== -1) {
                  setTimeout(() => {
                    dispatch(refreshSessionIdOfTipe(tmp))
                  }, 500)
                }
              } else {
                // 削除された
                dispatch(removeTipe(library.tipes.findIndex((element) => { return element.id === newDoc.id })))
              }
              resolve()
            },
            error: (error) => {
              console.log('error occurred')
              console.log(error)
              resolve()
            }
          })
        })
        if (querySnapshot.docs.length === 0) {
          dispatch(setLoadingStatus(LoadingStatus.loaded))
        }
      })
    })
  }
}

export const loadEveryTipesFromFirebase = async (dispatch: Dispatch<any>) => {
  return new Promise((resolve) => {
    doc.collection('tipes')
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
    doc.collection('tipes')
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
    doc.collection('threads')
      .where('is', '==', 'thread')
      .orderBy('editDate', 'desc')
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
    doc.collection('tipes')
      .doc(stateBefore.library.tipes[index].id)
      .set(Object.assign({}, stateBefore.library.tipes[index]), { merge: true })
  }
}
export const removeTipeFromFirebase = (id: string) => {
  return () => {
    doc.collection('tipes').doc(id).set({
      // queryでの消えと区別するため、明示的に消していることを示す
      isRemoving: true
    }, { merge: true }).then(() => {
      doc.collection('tipes')
        .doc(id).delete()
    })
  }
}
export const pushThreadToFirebase = (index: number) => {
  return (dispatch: Dispatch<any>, getState: ()=>{library: LibraryState}) => {
    const stateBefore = getState()
    doc.collection('threads')
      .doc(stateBefore.library.threads[index].id)
      .set(Object.assign({}, stateBefore.library.threads[index]), { merge: true })
  }
}
export const removeThreadFromFirebase = (id: string) => {
  return () => {
    doc.collection('threads')
      .doc(id).delete()
  }
}

export const migrate = async (ver1doc: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>, dispatch: Dispatch<any>) => {
  console.log('migration func')
  const data = ver1doc.data()
  if (data !== undefined) {
    data.content.forEach((element: {text: string, title: string}) => {
      const newTipe = newTipeState()
      newTipe.title = element.title
      newTipe.text = element.text
      dispatch(addTipe(newTipe))
      dispatch(pushTipeToFirebase(0))
    })
  }
}

export default librarySlice.reducer
