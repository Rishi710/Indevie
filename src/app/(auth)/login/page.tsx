import React from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";

export const metadata = {
  title: "Login - Indevie Beauty",
  description: "Log in to your Indevie Beauty account to manage orders and your beauty ritual.",
};

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Enter your details to access your Indevie account"
    >
      <LoginForm />
    </AuthLayout>
  );
}
