import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import libraryReducer from './slice'

export const store = configureStore({
  reducer: {
    library: libraryReducer
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;