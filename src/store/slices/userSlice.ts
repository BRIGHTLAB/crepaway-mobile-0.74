import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { POST } from '../../api';
import NotificationService from '../../utils/NotificationService';

interface LoginResponse {
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      phone_number: string;
      image_url: string | null;
      dob: string;
    }
    access_token: string;
  }
}

interface LoginCredentials {
  phone_number: string;
  password: string;
}

interface IUser {
  phoneNumber: string;
  id: number | null;
  email: string;
  access_token: string | null;
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  orderType: OrderType['alias'] | null;
  menuType: OrderType['menu_type'] | null;
  branchName: string | null;
  addressId: number | null;
  addressLatitude: number | null;
  addressLongitude: number | null;
  isLoggedIn: boolean;
  tableSessionId: string | null;
  name: string;
  image_url: string | null;
  branchTable: string | null;
  addressTitle: string | null;
  error: string | null;
}

const initialState: IUser = {
  phoneNumber: '',
  id: null,
  email: '',
  access_token: null,
  status: 'idle',
  isLoggedIn: false,
  orderType: null,
  branchName: null,
  addressTitle: null,
  addressLatitude: null,
  addressLongitude: null,
  menuType: null,
  addressId: null,
  branchTable: null,
  tableSessionId: null,
  image_url: null,
  name: '',
  error: null,
};

// Load token from AsyncStorage on app start
// export const loadUserToken = createAsyncThunk(
//   'user/loadToken',
//   async (_, { dispatch }) => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       if (token) {
//         dispatch(loginUser(token));
//       }
//     } catch (error) {
//       console.error('Failed to load token from AsyncStorage', error);
//     }
//   },
// );

// Login thunk
export const loginUserThunk = createAsyncThunk(
  'user/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    console.log('credentials', credentials);
    const response = await POST<LoginResponse>({
      endpoint: '/auth/login',
      formData: credentials,
      requiresAuth: false,
    });

    if (response.status < 400 && response.data?.data) {
      console.log('login user thunk response', response.data?.data);
      return response.data?.data;
    } else {
      console.log('response', response);
      return rejectWithValue(
        response?.message || 'Invalid credentials. Please try again',
      );
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setOrderType: (
      state,
      action: PayloadAction<{
        orderTypeAlias: OrderType['alias'];
        menuType: OrderType['menu_type'];
      }>,
    ) => {
      return {
        ...state,
        orderType: action.payload.orderTypeAlias,
        menuType: action.payload.menuType,
      };
    },
    setBranchName: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        branchName: action.payload ? action.payload.toLowerCase() : null,
      };
    },
    setAddress: (
      state,
      action: PayloadAction<{
        id: number | null;
        title: string | null;
        longitude: number | null;
        latitude: number | null;
      }>,
    ) => {
      return {
        ...state,
        addressId: action.payload.id,
        addressLongitude: action.payload.longitude,
        addressLatitude: action.payload.latitude,
        addressTitle: action.payload.title,
      };
    },
    setSessionTableId: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        tableSessionId: action.payload,
      };
    },
    setBranchTable: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        branchTable: action.payload,
      };
    },
    logoutUser: state => {
      NotificationService.getInstance().deregister();
      return { ...initialState };
    },
    autoLoginUser: (state, action: PayloadAction<LoginResponse>) => {
      return {
        ...state,
        id: action.payload.data?.user?.id,
        access_token: action.payload.data?.access_token,
        name: action.payload.data?.user?.name,
        image_url: action.payload.data?.user?.image_url,
        isLoggedIn: true,
      };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUserThunk.pending, state => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        state.access_token = action.payload.access_token;
        state.id = action.payload.user.id;
        state.name = action.payload.user.name;
        state.image_url = action.payload.user.image_url;
        // state.email = action.payload.user.email;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.payload as string;
      });
  },
});

export const {
  setSessionTableId,
  setOrderType,
  setBranchName,
  autoLoginUser,
  logoutUser,
  setAddress,
  setBranchTable,
} = userSlice.actions;
export default userSlice.reducer;
