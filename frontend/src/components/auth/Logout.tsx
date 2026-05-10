import { Button } from '../ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router';

const Logout = () => {
  const { logOut } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/signin');
    } catch (error) {
      console.log(error);
    }
  };
  return <Button onClick={() => handleLogout()}>Logout</Button>;
};

export default Logout;
