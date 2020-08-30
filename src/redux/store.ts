import { configureStore } from '@reduxjs/toolkit'
import libraryReducer from './librarySlice'
import viewReducer from './viewSlice'

export const store = configureStore({
  reducer: {
    library: libraryReducer,
    view: viewReducer
  }
})

export type RootState = ReturnType<typeof store.getState>;
// export type AppThunk<ReturnType = void> = ThunkAction<
//   ReturnType,
//   RootState,
//   unknown,
//   Action<string>
// >;
