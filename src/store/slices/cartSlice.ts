import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import uuid from 'react-native-uuid';
import { GET } from '../../api';

export interface CartItem {
  id: number;
  items_id: number;
  categories_id: number;
  plu: string;
  quantity: number;
  special_instruction: string;
  modifier_groups?: CartModifierGroup[];
  // optional for now
  price?: number;
  symbol?: string;
  name?: string;
  description?: string;
  // image?: string;
  image_url?: string;
  // need to recheck why we have image and image_url
}

interface CartModifierGroup {
  id: number;
  modifier_groups_id: number;
  modifier_items: ModifierItem[];
  // optional for now
  name?: string;
}

interface ModifierItem {
  plu: string;
  id: number;
  price: number | null;
  quantity: number;
  modifier_items_id: number;
  // optional for now
  name?: string;
  symbol?: string;
}

export interface DeliveryInstruction {
  id: number;
  title: string;
}

interface ICart {
  items: { [uuid: string]: CartItem };
  orderType: OrderType['alias'] | null;
  branchName: string | null;
  promoCode: string | null;
  deliveryInstructions: DeliveryInstruction[];
  specialDeliveryInstructions: string;
  sendCutlery: string;
  scheduleOrder: string | null;
  scheduledDateTime: string | null; // Stored as ISO string for serialization
  loading: boolean;
  error: string | null;
  isSyncing: boolean;
}

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await GET<{
        items: { [uuid: string]: CartItem };
      }>({ endpoint: `/cart` });

      if (response.data && response.data.items) {
        return {
          items: JSON.parse(JSON.stringify(response.data.items)),
        };
      }

      return { items: {} };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return rejectWithValue('Failed to fetch cart data');
    }
  },
);

const initialState: ICart = {
  items: {},
  loading: false,
  error: null,
  orderType: null,
  branchName: null,
  promoCode: null,
  deliveryInstructions: [],
  specialDeliveryInstructions: '',
  sendCutlery: 'no',
  scheduleOrder: 'no',
  scheduledDateTime: null,
  isSyncing: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const uuidValue = uuid.v4().toString();
      const itemCopy = JSON.parse(JSON.stringify(action.payload));
      return {
        ...state,
        items: {
          ...state.items,
          [uuidValue]: itemCopy,
        },
      };
    },
    updateItem: (
      state,
      action: PayloadAction<{ uuid: string; item: CartItem }>,
    ) => {
      // const { uuid, item } = action.payload;
      if (state.items[action.payload.uuid]) {
        const itemCopy = JSON.parse(JSON.stringify(action.payload.item));
        return {
          ...state,
          items: {
            ...state.items,
            [action.payload.uuid]: itemCopy,
          },
        };
      }
    },
    increaseQuantity: (state, action: PayloadAction<string>) => {
      if (state.items[action.payload]) {
        return {
          ...state,
          items: {
            ...state.items,
            [action.payload]: {
              ...state.items[action.payload],
              quantity: state.items[action.payload].quantity + 1,
            },
          },
        };
      }
    },
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      if (
        state.items[action.payload] &&
        state.items[action.payload].quantity > 1
      ) {
        return {
          ...state,
          items: {
            ...state.items,
            [action.payload]: {
              ...state.items[action.payload],
              quantity: state.items[action.payload].quantity - 1,
            },
          },
        };
      } else {
        delete state.items[action.payload];
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      delete state.items[action.payload];
    },
    clearCart: state => {
      return {
        ...state,
        items: {},
        promoCode: null,
        deliveryInstructions: [],
        specialDeliveryInstructions: '',
        sendCutlery: 'no',
        scheduleOrder: 'no',
        scheduledDateTime: null,
      };
    },
    setCartFromFetch: (
      state,
      action: PayloadAction<{ items: { [uuid: string]: CartItem } }>,
    ) => {
      const items = JSON.parse(JSON.stringify(action.payload.items));
      return {
        ...state,
        items: items,
      };
    },
    setCartOrderType: (
      state,
      action: PayloadAction<OrderType['alias'] | null>,
    ) => {
      return {
        ...state,
        orderType: action.payload,
      };
    },
    setCartBranchName: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        branchName: action.payload,
      };
    },
    setCartSyncing: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isSyncing: action.payload,
      };
    },
    setPromoCode: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        promoCode: action.payload,
      };
    },
    setDeliveryInstructions: (
      state,
      action: PayloadAction<{
        instructions: DeliveryInstruction[];
        specialNotes: string;
      }>,
    ) => {
      return {
        ...state,
        deliveryInstructions: action.payload.instructions,
        specialDeliveryInstructions: action.payload.specialNotes,
      };
    },
    setSendCutlery: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        sendCutlery: action.payload,
      };
    },
    setScheduleOrder: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        scheduleOrder: action.payload,
      };
    },
    setScheduledDateTime: (state, action: PayloadAction<Date | null>) => {
      return {
        ...state,
        scheduledDateTime: action.payload ? action.payload.toISOString() : null,
      };
    },
  },

  // },
  // extraReducers: (builder) => {
  //     builder
  //         .addCase(fetchCart.pending, (state) => {
  //             state.loading = true;
  //             state.error = null;
  //         })
  //         .addCase(fetchCart.fulfilled, (state, action) => {
  //             state.loading = false;
  //             if (action.payload?.items) {
  //                 // state.items = JSON.parse(JSON.stringify(action.payload.items));
  //                 return state = {
  //                     ...state,
  //                     items: JSON.parse(JSON.stringify(action.payload.items))
  //                 }
  //             } else {
  //                 // state.items = {};
  //                 return state = {
  //                     ...state,
  //                     items: {},
  //                     loading: false,
  //                 }
  //             }
  //         })
  //         .addCase(fetchCart.rejected, (state, action) => {
  //             state.loading = false;
  //             state.error = action.payload as string;
  //         });
});

export const {
  addItem,
  updateItem,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  clearCart,
  setCartFromFetch,
  setCartOrderType,
  setCartBranchName,
  setCartSyncing,
  setPromoCode,
  setDeliveryInstructions,
  setSendCutlery,
  setScheduleOrder,
  setScheduledDateTime,
} = cartSlice.actions;
export default cartSlice.reducer;
