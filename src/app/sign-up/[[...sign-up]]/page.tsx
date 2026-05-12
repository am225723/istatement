import { SignUp } from '@clerk/nextjs';
import { AuthFrame } from '@/components/auth-frame';

export default function Page() {
  return (
    <AuthFrame mode="sign-up">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" afterSignUpUrl="/app" />
    </AuthFrame>
  );
}
