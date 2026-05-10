import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Button } from '@/components/ui/button';

export function DarkModeToggle() {
  const { isDark, toggle, mounted } = useDarkMode();

  if (!mounted) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      className="rounded-full"
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
