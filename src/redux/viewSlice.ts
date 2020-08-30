import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { create } from 'domain'

interface ViewState {
  isDark: boolean
}

const initialViewState: ViewState = {
  isDark: false
}

export const viewSlice = createSlice({
  name: 'view',
  initialState: initialViewState,
  reducers: {
    setIsDark: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload
    }
  }
})

export const {
  setIsDark
} = viewSlice.actions
export const selectView = (state: RootState) => state.view

export default viewSlice.reducer
