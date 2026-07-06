import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';
  // Fallback to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDarkMode: getInitialTheme()
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      const themeStr = state.isDarkMode ? 'dark' : 'light';
      localStorage.setItem('theme', themeStr);
      
      // Update DOM
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setTheme: (state, action) => {
      state.isDarkMode = action.payload;
      const themeStr = action.payload ? 'dark' : 'light';
      localStorage.setItem('theme', themeStr);
      if (action.payload) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
