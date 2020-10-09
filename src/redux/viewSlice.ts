import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

export enum LoadingStatus{
  loading,
  migrating,
  firstDataLoaded,
  loaded
}

export enum ConnectedStatus {
  connected,
  disconnected
}

interface ViewState {
  loadingStatus: LoadingStatus,
  connectedStatus: ConnectedStatus,
  isDark: boolean,
  isFlipped: boolean,
  lang: string
}

const initialViewState: ViewState = {
  loadingStatus: LoadingStatus.loading,
  connectedStatus: ConnectedStatus.connected,
  isDark: false,
  isFlipped: false,
  lang: 'ja'
}

export const viewSlice = createSlice({
  name: 'view',
  initialState: initialViewState,
  reducers: {
    setLoadingStatus: (state, action: PayloadAction<LoadingStatus>) => {
      state.loadingStatus = action.payload
      console.log('setLoadingStatus: ' + LoadingStatus[action.payload])
    },
    setConnectedStatus: (state, action: PayloadAction<ConnectedStatus>) => {
      state.connectedStatus = action.payload
      console.log('setConnectedStatus: ' + ConnectedStatus[action.payload])
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
