import { SignIn } from '@clerk/nextjs';
import { AuthFrame } from '@/components/auth-frame';

export default function Page() {
  return (
    <AuthFrame mode="sign-in">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" afterSignInUrl="/app" />
    </AuthFrame>
  );
}
