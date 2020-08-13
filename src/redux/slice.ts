import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from './store'

interface TextState {
    value: string,
    date: string | undefined
}

const initialState: TextState = {
  value: 'not edited',
  date: undefined
}

export const textSlice = createSlice({
  name: 'text',
  initialState,
  reducers: {
    edit: (state, action: PayloadAction<string>) => {
      state.value = action.payload
      state.date = String(new Date())
    }
  }
})

export const { edit } = textSlice.actions
export const selectText = (state: RootState) => state.text

export default textSlice.reducer
