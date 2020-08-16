import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from './store'
import { v4 as uuidv4 } from 'uuid'

interface TipeState {
    id: string,
    title: string | undefined,
    text: string,
    date: string | undefined,
    thread: string | undefined,
    parentid: string | undefined
}

function newTipeState () : TipeState {
  return {
    id: uuidv4(),
    title: '',
    text: 'not edited',
    date: String(new Date()),
    thread: undefined,
    parentid: undefined
  }
}

interface LibraryState {
  content: Array<TipeState>
}

const initialLibraryState: LibraryState = {
  content: [newTipeState()]
}

interface indexPayload {
  index: number,
  value: string
}

export const librarySlice = createSlice({
  name: 'library',
  initialState: initialLibraryState,
  reducers: {
    add: (state) => {
      state.content.push(newTipeState())
    },
    remove: (state, action: PayloadAction<number>) => {
      state.content.splice(action.payload, 1)
    },
    editText: (state, action: PayloadAction<indexPayload>) => {
      state.content[action.payload.index].text = action.payload.value
      state.content[action.payload.index].date = String(new Date())
    },
    editTitle: (state, action: PayloadAction<indexPayload>) => {
      state.content[action.payload.index].title = action.payload.value
      state.content[action.payload.index].date = String(new Date())
    }
  }
})

export const { add, remove, editText, editTitle } = librarySlice.actions
export const selectLibrary = (state: RootState) => state.library

export default librarySlice.reducer
