import React from "react";
import AuthLayout from "@/app/components/auth/AuthLayout";
import ActivateForm from "@/app/components/auth/ActivateForm";

export const metadata = {
    title: "Activate Account - Indevie Beauty",
    description: "Complete your registration to start your skincare journey.",
};

interface PageProps {
    params: Promise<{
        id: string;
        token: string;
    }>;
}

export default async function ActivatePage({ params }: PageProps) {
    const { id, token } = await params;

    return (
        <AuthLayout
            title="Welcome to Indevie"
            subtitle="Activate your account to join the community"
        >
            <div className="py-8 lg:py-12">
                <ActivateForm customerId={id} activationToken={token} />
            </div>
        </AuthLayout>
    );
}
