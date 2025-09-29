import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DineInState {
    isTableLocked: boolean;
}

const initialState: DineInState = {
    isTableLocked: false,
};

const dineInSlice = createSlice({
    name: 'dineIn',
    initialState,
    reducers: {
        setIsTableLocked: (state, action: PayloadAction<boolean>) => {
            state.isTableLocked = action.payload;
        },
        resetDineInState: (state) => {
            state.isTableLocked = false;
        },
    },
});

export const { setIsTableLocked, resetDineInState } = dineInSlice.actions;
export default dineInSlice.reducer;
