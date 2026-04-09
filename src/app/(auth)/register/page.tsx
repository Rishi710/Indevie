import React from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import RegisterForm from "../../components/auth/RegisterForm";

export const metadata = {
  title: "Create Account - Indevie Beauty",
  description: "Join Indevie Beauty to track your orders and enjoy a personalized shopping experience.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
    title="Join the Indevie Community" 
    subtitle="Create an account for a more personalized experience"
    >
      <RegisterForm />
    </AuthLayout>
      
  );
}
