import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import backendReducer from './BackendReducers'

// Create a persist configuration
const persistConfig = {
  key: 'root', // key for the localStorage object
  storage, // storage engine
};

const persistedBoardsReducer = persistReducer(persistConfig, backendReducer);


const rootReducer = {
  boards: persistedBoardsReducer,
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

const persistor = persistStore(store);

export { store, persistor };
