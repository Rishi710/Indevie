import React from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Recover Password - Indevie Beauty",
  description: "Reset your Indevie Beauty account password to continue your skincare ritual.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout 
      title="Restore Balance" 
      subtitle="Enter your email to reset your Indevie access"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
