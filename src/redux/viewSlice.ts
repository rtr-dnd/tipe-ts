import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

interface ViewState {
  loadingStatus: string,
  connectedStatus: string,
  isDark: boolean,
  isFlipped: boolean,
  lang: string
}

const initialViewState: ViewState = {
  loadingStatus: 'loading',
  connectedStatus: 'connected',
  isDark: false,
  isFlipped: false,
  lang: 'ja'
}

export const viewSlice = createSlice({
  name: 'view',
  initialState: initialViewState,
  reducers: {
    setLoadingStatus: (state, action: PayloadAction<string>) => {
      state.loadingStatus = action.payload
    },
    setConnectedStatus: (state, action: PayloadAction<string>) => {
      state.connectedStatus = action.payload
    },
    setIsDark: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload
    }
  }
})

export const {
  setLoadingStatus,
  setConnectedStatus,
  setIsDark
} = viewSlice.actions
export const selectView = (state: RootState) => state.view

export default viewSlice.reducer
