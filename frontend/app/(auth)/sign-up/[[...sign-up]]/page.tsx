import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <div>
      <SignUp afterSignUpUrl="/dashboard" />
    </div>
  );
};

export default SignUpPage;
