import { TextStyle } from 'react-native';
import { normalizeFont } from './utils/normalizeFonts';

export const COLORS = {
  primaryColor: '#DB0032',
  secondaryColor: '#4E1485',
  darkColor: '#191919',
  lightColor: '#F7F7F7',
  foregroundColor: '#8391A1',
  borderColor: '#D9D9D9',
  card: '#FFFFFF',
  yellow: '#F9CA03',
  yellowLight: '#F9CA0356',
  accentColor: '#D9D9D9',
  tertiaryColor: '#BABABA',
  errorColor: '#DB0032',
  black: '#191919',
  white: '#ffffff',
  placeholderColor: '#8391A1',
  primaryGradient: ['#DB0032', '#B6022B'],
};

export const SCREEN_PADDING = {
  horizontal: 16,
  vertical: 16,
};

export const INPUT_HEIGHT = 53;

// export const BASE_URL = 'http://dev.mikael.pc:8080/api/app';
// export const BASE_URL = 'https://cc9099b8927d.ngrok-free.app/api/app';
export const BASE_URL =
  'https://crepaway.staging-api.thenewexperience.app/api/app';

export const API_MAP_KEY = 'AIzaSyA0IxviANpXAl-sTNcYjH1zU5cjgXimKuk';
export const DRIVER_SOCKET_URL = 'wss://crepaway.realtime.driver-tracking.com';
export const DINEIN_SOCKET_URL =
  'wss://crepaway-dinein-websocket-ts-hgga.onrender.com';

export const TOAST_OFFSET = -80;

export const GOOGLE_API_KEY =
  '989336303690-5dsedobl05pj96r71550h24g499imub2.apps.googleusercontent.com';

export const FACEBOOK_APP_ID = '494126693233412';

export const TYPOGRAPHY = {
  LARGE_TITLE: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(48),
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 56,
  },
  MAIN_TITLE: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(32),
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  TITLE: {
    fontFamily: 'Poppins-regular',
    fontSize: normalizeFont(24),
    LineHeight: 36,
    fontWeight: '500' as TextStyle['fontWeight'],
  },

  HEADLINE: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(20),
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  SUB_HEADLINE: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(16),
    lineHeight: 24,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  BODY: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(14),
    lineHeight: 21,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  TAGS: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(10),
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  CTA: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(12),
    fontWeight: '500' as TextStyle['fontWeight'],
  },
};

export const REGEX = {
  ALPHANUMERIC_16: {
    regex: '^([a-zA-Z0-9_\\-.]){1,16}$',
    valFailureMsg: 'Please enter an alphanumeric string up to 16 characters',
  },
  ALPHANUMERIC_35: {
    regex: '^([a-z A-Z0-9_\\-.]){1,35}$',
    valFailureMsg: 'Please enter an alphanumeric string up to 35 characters',
  },
  ALPHANUMERIC_50: {
    regex: '^([a-zA-Z0-9_\\-.]){1,50}$',
    valFailureMsg: 'Please enter an alphanumeric string up to 50 characters',
  },
  ALPHANUMERIC_65: {
    regex: '^([a-z A-Z0-9_\\-.]){1,65}$',
    valFailureMsg: 'Please enter an alphanumeric string up to 65 characters',
  },
  INT_PHONE: {
    regex: '^([0-9]){7,14}$',
    valFailureMsg: 'Please enter an International Format Phone Number',
  },
  EMAIL: {
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$',
    valFailureMsg: 'Please enter an valid Email Address',
  },
  PASSWORD: {
    regex:
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?]).{8,}$',
    valFailureMsg:
      'Password must be at least 8 characters with mixed case, numbers, and symbols',
  },
  EMAIL_USERNAME: {
    regex:
      /^((\+?\d{1,3}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})$|^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i,
    valFailureMsg: 'Please enter a valid Email Address/Phone Number',
  },
};
