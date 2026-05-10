import api from '@/lib/axios';

export const authService = {
  signUp: async (
    userName: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => {
    const res = await api.post('/auth/signup', {
      userName,
      password,
      email,
      firstName,
      lastName,
    });

    return res.data;
  },

  signIn: async (userName: string, password: string) => {
    const res = await api.post('/auth/signin', { userName, password });

    return res.data;
  },

  logOut: async () => {
    return await api.post('/auth/logout');
  },
};
