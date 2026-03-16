import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DineInState {
    isTableLocked: boolean;
    socketUrl: string | null;
}

const initialState: DineInState = {
    isTableLocked: false,
    socketUrl: null,
};

const dineInSlice = createSlice({
    name: 'dineIn',
    initialState,
    reducers: {
        setIsTableLocked: (state, action: PayloadAction<boolean>) => {
            state.isTableLocked = action.payload;
        },
        setSocketUrl: (state, action: PayloadAction<string | null>) => {
            state.socketUrl = action.payload;
        },
        resetDineInState: (state) => {
            state.isTableLocked = false;
            state.socketUrl = null;
        },
    },
});

export const { setIsTableLocked, setSocketUrl, resetDineInState } = dineInSlice.actions;
export default dineInSlice.reducer;
