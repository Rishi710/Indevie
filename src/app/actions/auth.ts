"use server";

import { cookies } from "next/headers";
import { loginCustomer, registerCustomer, recoverCustomer, updateCustomer } from "@/lib/shopify";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const result = await loginCustomer(email, password);

  if (result?.customerUserErrors?.length > 0) {
    return { success: false, error: result.customerUserErrors[0].message };
  }

  const accessToken = result?.customerAccessToken?.accessToken;
  const expiresAt = result?.customerAccessToken?.expiresAt;

  if (accessToken) {
    const cookieStore = await cookies();
    cookieStore.set("customerAccessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(expiresAt),
      path: "/",
    });
    
    return { success: true, error: null };
  }

  return { success: false, error: "Invalid login credentials" };
}

export async function registerAction(prevState: any, formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !firstName || !lastName) {
    return { success: false, error: "All fields are required" };
  }

  const result = await registerCustomer({
    firstName,
    lastName,
    email,
    password,
  });

  if (result?.customerUserErrors?.length > 0) {
    return { success: false, error: result.customerUserErrors[0].message };
  }

  if (result?.customer) {
    // Automatically log in after registration
    return await loginAction(prevState, formData);
  }

  return { success: false, error: "Registration failed" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("customerAccessToken");
  redirect("/");
}

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, error: "Email is required" };
  }

  const result = await recoverCustomer(email);

  if (result?.customerUserErrors?.length > 0) {
    return { success: false, error: result.customerUserErrors[0].message };
  }

  return { success: true, error: null };
}

export async function updateCustomerAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("customerAccessToken")?.value;

  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  if (!firstName || !lastName || !email) {
    return { success: false, error: "Name and email are required" };
  }

  const result = await updateCustomer(token, {
    firstName,
    lastName,
    email,
    phone: phone || null,
  });

  if (result?.customerUserErrors?.length > 0) {
    return { success: false, error: result.customerUserErrors[0].message };
  }

  // If the email was changed, Shopify might return a new access token
  if (result?.customerAccessToken?.accessToken) {
    const expiresAt = result.customerAccessToken.expiresAt;
    cookieStore.set("customerAccessToken", result.customerAccessToken.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(expiresAt),
      path: "/",
    });
  }

  revalidatePath("/account");
  return { success: true, error: null };
}
