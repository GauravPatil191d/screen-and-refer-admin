import axiosClient from "@/utils/axiosClient";

export type UserRole = "DOCTOR" | "HEALTH_WORKER";

export interface CreateUserInput {
  user_id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreatedUser {
  user_generated_id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserResponse {
  success: boolean;
  data?: CreatedUser;
  message?: string;
}

export const UserService = {
  async createUser(input: CreateUserInput): Promise<CreatedUser> {
    const response = await axiosClient.post<CreateUserResponse>(
      "/users/create-user",
      input
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Unable to create user");
    }

    return response.data.data;
  },
};