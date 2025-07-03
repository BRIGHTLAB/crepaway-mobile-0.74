import {createSlice} from '@reduxjs/toolkit';

type NotificationsState = {
  data: Notification[];
};

const initialState: NotificationsState = {
  data: [
    {
      id: 1,
      content:
        'You have a new message #1 You have a new message #1 You have a n',
      is_read: 0,
      date: new Date().toISOString(), // Just now
    },
    {
      id: 2,
      content: 'You have a new message #2',
      is_read: 1,
      date: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
    },
    {
      id: 3,
      content: 'You have a new message #2',
      is_read: 0,
      date: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
    },
    {
      id: 4,
      content: 'You have a new message #2',
      is_read: 1,
      date: new Date(Date.now() - 24 * 3600000).toISOString(), // Yesterday
    },
    {
      id: 5,
      content: 'You have a new message #2',
      is_read: 0,
      date: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), // 3 days ago (This Week)
    },
    {
      id: 6,
      content: 'You have a new message #2',
      is_read: 1,
      date: new Date(Date.now() - 15 * 24 * 3600000).toISOString(), // 15 days ago (This Month)
    },
    {
      id: 7,
      content: 'You have a new message #2',
      is_read: 0,
      date: new Date(Date.now() - 60 * 24 * 3600000).toISOString(), // 2 months ago (Older)
    },
    {
      id: 8,
      content: 'You have a new message #2',
      is_read: 1,
      date: new Date(Date.now() - 365 * 24 * 3600000).toISOString(), // 1 year ago (Older)
    },
  ],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
});

export const {} = notificationsSlice.actions;
export default notificationsSlice.reducer;
