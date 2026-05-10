import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import type { AuthState } from '@/types/store';

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,
  setAccessToken: accessToken => {
    set({ accessToken });
  },
  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },
  signUp: async (userName, firstName, lastName, email, password) => {
    try {
      set({ loading: true });
      // call api
      await authService.signUp(userName, password, email, firstName, lastName);
      toast.success('Sign up sucessfully, you will be redirect to login page');
    } catch (error) {
      console.error(error);
      toast.error('Sign up failed');
    } finally {
      set({ loading: false });
    }
  },
  signIn: async (userName, password) => {
    try {
      set({ loading: true });
      const { accessToken } = await authService.signIn(userName, password);
      get().setAccessToken(accessToken);

      await get().fetchMe();
      toast.success('Sign in successfully');
    } catch (error) {
      console.error(error);
      toast.error('Sign in failed');
    } finally {
      set({ loading: false });
    }
  },
  logOut: async () => {
    try {
      get().clearState();
      await authService.logOut();
      toast.success('Log out successfully');
    } catch (error) {
      console.error(error);
      toast.error('Log out failed, please try again');
    }
  },
  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();
      set({ user: user });
    } catch (error) {
      console.error(error);
      set({ user: null, accessToken: null });
      toast.error('Error happen when get user information, please try again');
    } finally {
      set({ loading: false });
    }
  },
  refresh: async () => {
    try {
      set({ loading: true });
      const { user, fetchMe, setAccessToken } = get();
      const accessToken = await authService.refresh();
      setAccessToken(accessToken);
      if (!user) {
        await fetchMe();
      }
    } catch (error) {
      console.error(error);
      toast.error('Login section has been expired, please login again');
      get().clearState();
    } finally {
      set({ loading: false });
    }
  },
}));
