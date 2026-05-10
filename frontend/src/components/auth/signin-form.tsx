import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '../ui/label';
import type React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router';

const signInSchema = z.object({
  username: z.string().min(3, 'User name at least 3 characters'),
  password: z.string().min(6, 'Password must be more than 6 characters'),
});

// typeof:  lấy kiểu dữ liệu của signUpSchema
// infer: tự suy ra kiểu
// => Từ cái schema, tự suy ra kiểu của form
type SigninFormValues = z.infer<typeof signInSchema>;

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  const onSubmit = async (data: SigninFormValues) => {
    // call backend
    const { username, password } = data;
    await signIn(username, password);
    navigate('/');
  };

  return (
    <div className={cn('min-h-screen w-full relative', className)} {...props}>
      <div className="absolute inset-0 z-0 dark:block hidden gradient-dark-glow" />
      <div className="relative z-10 flex flex-col gap-6 p-6">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
              {/* Logo and Title */}
              <div className="flex flex-col gap-4 mb-6 ">
                <div className="flex flex-col items-center text-center gap-2">
                  <a href="/" className="mx-auto block w-fit text-center">
                    <img src="/logo.svg" alt="Logo" />
                  </a>
                </div>

                <h2 className="text-2xl font-bold ">Welcome back</h2>
                <p className="text-muted-foreground text-balance">
                  Login your Lobby account.
                </p>
              </div>

              {/* User name, email and Password */}
              <div className="flex flex-col mt-2 gap-3 text-start">
                <Label
                  htmlFor="username"
                  className="block text-sm font-medium space-y-2"
                >
                  User Name
                </Label>
                <Input
                  id="username"
                  placeholder="Steve"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-destructive text-sm">
                    {errors.username.message}
                  </p>
                )}

                <Label htmlFor="password" className="block text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* Sign Up Button */}
              <Button
                type="submit"
                className="w-full space-y-10 mt-6"
                disabled={isSubmitting}
              >
                Log in
              </Button>

              <div className="text-center text-sm">
                Don't have an account?{' '}
                <a href="/signup" className="text-primary hover:underline">
                  Sign up
                </a>
              </div>
            </form>
            <div className="relative hidden md:block bg-transparent">
              <img
                src="/placeholder.png"
                alt="Image"
                className="absolute top-1/2 -translate-y-1/2 object-cover"
              />
            </div>
          </CardContent>
        </Card>
        <div className="text-xs px-6 text-balance text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *[a]underline-offset-4">
          By clicking continue, you agree to our{' '}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}
