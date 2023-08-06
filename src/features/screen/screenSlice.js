import { createSlice } from "@reduxjs/toolkit";
import { DISPLAYS } from "../../app/constants";

const initialState = {
    display: DISPLAYS.INPUT
};

export const screenSlice = createSlice({
    name: 'screen',
    initialState,
    reducers: {
        display: (state, action) => {
            const display = action.payload;
            state.display = display;
        }
    }
});

export const { display } = screenSlice.actions;

export default screenSlice.reducer;