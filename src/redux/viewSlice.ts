import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

interface ViewState {
  status: string,
  isDark: boolean,
  isFlipped: boolean,
  lang: string
}

const initialViewState: ViewState = {
  status: 'loading',
  isDark: false,
  isFlipped: false,
  lang: 'ja'
}

export const viewSlice = createSlice({
  name: 'view',
  initialState: initialViewState,
  reducers: {
    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload
    },
    setIsDark: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload
    }
  }
})

export const {
  setStatus,
  setIsDark
} = viewSlice.actions
export const selectView = (state: RootState) => state.view

export default viewSlice.reducer
