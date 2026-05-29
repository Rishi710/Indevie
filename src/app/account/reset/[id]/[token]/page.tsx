import React from "react";
import AuthLayout from "@/app/components/auth/AuthLayout";
import ResetPasswordForm from "@/app/components/auth/ResetPasswordForm";

export const metadata = {
    title: "Reset Password - Indevie Beauty",
    description: "Reset your Indevie Beauty account password.",
};

interface PageProps {
    params: Promise<{
        id: string;
        token: string;
    }>;
}

export default async function ResetPage({ params }: PageProps) {
    const { id, token } = await params;

    return (
        <AuthLayout
            title="Secure Your Account"
            subtitle="Choose a new password to get back to your skincare rituals"
        >
            <div className="py-8 lg:py-12">
                <ResetPasswordForm customerId={id} resetToken={token} />
            </div>
        </AuthLayout>
    );
}
