import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import type { AuthState } from '@/types/store';

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,
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
}));
