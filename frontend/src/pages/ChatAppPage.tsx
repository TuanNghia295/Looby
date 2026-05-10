import Logout from '@/components/auth/Logout';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

function ChatAppPage() {
  const user = useAuthStore(e => e.user);
  const handleOnClick = async () => {
    try {
      await api.get('/users/test');
      toast.success('ok');
    } catch (error) {
      toast.error('Failed');
      console.error(error);
    }
  };
  return (
    <div>
      {user?.userName}
      <Logout />

      <Button onClick={handleOnClick}>Test</Button>
    </div>
  );
}

export default ChatAppPage;
