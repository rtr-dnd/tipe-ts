import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { v4 as uuidv4 } from 'uuid'

interface TipeState {
    id: string,
    title: string | undefined,
    text: string,
    date: number | undefined,
    thread: string | undefined,
    parentid: string | undefined
}

function newTipeState () : TipeState {
  return {
    id: uuidv4(),
    title: '',
    text: 'not edited',
    date: new Date().getTime(),
    thread: undefined,
    parentid: undefined
  }
}

interface ThreadState {
  id: string,
  title: string | undefined,
  children: Array<string>
}

function newThreadState (parent: string) : ThreadState {
  return {
    id: uuidv4(),
    title: '',
    children: [parent]
  }
}

interface LibraryState {
  tipes: Array<TipeState>,
  threads: Array<ThreadState>
}

const initialLibraryState: LibraryState = {
  tipes: [newTipeState()],
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
      state.tipes.push(newTipeState())
    },
    removeTipe: (state, action: PayloadAction<number>) => {
      state.tipes.splice(action.payload, 1)
    },
    editTextOfTipe: (state, action: PayloadAction<indexPayload>) => {
      state.tipes[action.payload.index].text = action.payload.value
      state.tipes[action.payload.index].date = new Date().getTime()
    },
    editTitleOfTipe: (state, action: PayloadAction<indexPayload>) => {
      state.tipes[action.payload.index].title = action.payload.value
      state.tipes[action.payload.index].date = new Date().getTime()
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
  removeTipe,
  editTextOfTipe,
  editTitleOfTipe,
  editThreadOfTipe,
  createThread
} = librarySlice.actions
export const selectLibrary = (state: RootState) => state.library

export default librarySlice.reducer
