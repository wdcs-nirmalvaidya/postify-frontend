import axios from "axios";
import { SignupForm, LoginForm } from "../../types/auth.types";

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = async (data: SignupForm) => {
  try {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        error.message || "Internel Server Error,Registration Failed.",
      );
    }
  }
};

export const loginUser = async (data: LoginForm) => {
  try {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Internel Server Error,Login Failed");
    }
  }
};
