import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div>
      <SignIn afterSignInUrl="/dashboard" />
    </div>
  );
};

export default SignInPage;
