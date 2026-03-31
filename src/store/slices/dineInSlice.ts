import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TableBillPayment = {
    uuid: string;
    userId: string;
    name: string;
    amount: number | null;
    status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | null;
    paymentMode: 'FULL' | 'CUSTOM' | 'SPLIT' | null;
    paymentMethod: 'Card' | 'Cash' | 'Whish';
};

export type TableBill = {
    tableUuid: string;
    total: number;
    remainingToPay: number;
    payments: TableBillPayment[];
    cashCollectedAmount: number | null;
    activeFullPayer?: {
        userId: string;
        paymentId: string;
    };
};

interface DineInState {
    isTableLocked: boolean;
    socketUrl: string | null;
    tableBill: TableBill | null;
    orderId: number | null;
    canPayBill: boolean;
}

const initialState: DineInState = {
    isTableLocked: false,
    socketUrl: null,
    tableBill: null,
    orderId: null,
    canPayBill: false,
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
        setTableBill: (state, action: PayloadAction<TableBill | null>) => {
            state.tableBill = action.payload;
        },
        setDineInOrderId: (state, action: PayloadAction<number | null>) => {
            state.orderId = action.payload;
        },
        setCanPayBill: (state, action: PayloadAction<boolean>) => {
            state.canPayBill = action.payload;
        },
        resetDineInState: (state) => {
            state.isTableLocked = false;
            state.socketUrl = null;
            state.tableBill = null;
            state.orderId = null;
            state.canPayBill = false;
        },
    },
});

export const { setIsTableLocked, setSocketUrl, setTableBill, setDineInOrderId, setCanPayBill, resetDineInState } = dineInSlice.actions;
export default dineInSlice.reducer;
