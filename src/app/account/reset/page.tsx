import React from "react";
import { redirect } from "next/navigation";
import AuthLayout from "@/app/components/auth/AuthLayout";
import ResetByUrlForm from "@/app/components/auth/ResetByUrlForm";

export const metadata = {
    title: "Reset Password - Indevie Beauty",
    description: "Reset your Indevie Beauty account password.",
};

interface PageProps {
    searchParams: Promise<{ resetUrl?: string }>;
}

export default async function ResetPage({ searchParams }: PageProps) {
    const { resetUrl } = await searchParams;

    // No resetUrl param → redirect to forgot-password
    if (!resetUrl) {
        redirect("/forgot-password");
    }

    return (
        <AuthLayout
            title="Secure Your Account"
            subtitle="Choose a new password to get back to your skincare rituals"
        >
            <div className="py-8 lg:py-12">
                <ResetByUrlForm resetUrl={decodeURIComponent(resetUrl)} />
            </div>
        </AuthLayout>
    );
}
