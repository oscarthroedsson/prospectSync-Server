import { getUserRepository } from "../../repositories/user.repository";
import { IUser, IUserWithRelations } from "../../Types/user.types";

export class UserService {
  private userRepo = getUserRepository();

  async create(data: IUser): Promise<IUser> {
    if (!data.email) throw new Error("Email is required");

    const existingUser = await this.userRepo.showByEmail(data.email);
    if (existingUser) throw new Error("User with this email already exists");

    return this.userRepo.create(data);
  }

  async showById(id: string): Promise<IUserWithRelations | null> {
    if (!id) throw new Error("User ID is required");

    return this.userRepo.show(id);
  }

  async showByEmail(email: string): Promise<IUserWithRelations | null> {
    if (!email) throw new Error("Email is required");

    return this.userRepo.showByEmail(email);
  }

  async list(): Promise<IUser[]> {
    return this.userRepo.list();
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser> {
    if (!id) throw new Error("User ID is required");

    const existingUser = await this.userRepo.show(id);
    if (!existingUser) throw new Error("User not found");

    // Check if email is being changed to an existing email
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.userRepo.showByEmail(data.email);
      if (emailExists) throw new Error("Email already in use");
    }

    return this.userRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new Error("User ID is required");

    const existingUser = await this.userRepo.show(id);
    if (!existingUser) throw new Error("User not found");

    await this.userRepo.remove(id);
  }

  async getUsersByCompany(companyId: string): Promise<IUser[]> {
    if (!companyId) throw new Error("Company ID is required");

    return this.userRepo.findByCompanyId(companyId);
  }
}

let instance: UserService | null = null;

export function getUserService(): UserService {
  if (!instance) instance = new UserService();
  return instance;
}
