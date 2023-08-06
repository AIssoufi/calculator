import { configureStore } from "@reduxjs/toolkit";
import keyPadReducer from "../features/keyPad/keyPadSlice";
import screenReducer from "../features/screen/screenSlice";

export const store = configureStore({
    reducer: {
        keyPad: keyPadReducer,
        screen: screenReducer
    },
})