import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import textReducer from './slice'

export const store = configureStore({
  reducer: {
    text: textReducer
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
