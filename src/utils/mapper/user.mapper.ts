import type { IUserFull } from "../../Types/user.types";
import type {
  IUser,
  IUserWithRelations,
  IProviderDTO,
  IApplicationDTO,
  ICompanyDTO,
} from "../../Types/user.types";

export class UserMapper {
  /**
   * base() - Konverterar User till IUser (base fields only)
   * Används för normal visning utan relations
   */
  static base(user: IUser): IUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      isSearching: user.isSearching,
      companyId: user.companyId,
    };
  }

  /**
   * create() - Förbereder data för att skapa en ny user
   * Returnerar ett clean object utan undefined values
   */
  static create(data: Partial<IUser>): Partial<IUser> {
    const createData = {
      name: data.name,
      email: data.email,
      emailVerified: data.emailVerified,
      image: data.image,
      role: data.role ?? "user",
      isSearching: data.isSearching ?? false,
      companyId: data.companyId,
    };

    // Filtrera bort undefined values
    return Object.fromEntries(
      Object.entries(createData).filter(([_, value]) => value !== undefined)
    ) as Partial<IUser>;
  }

  /**
   * update() - Förbereder partial data för update-operationer
   * Filtrerar bort undefined values och id
   */
  static update(data: Partial<IUser>): Partial<Omit<IUser, "id">> {
    const { id, ...updateData } = data;

    // Filtrera bort undefined values
    return Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    ) as Partial<Omit<IUser, "id">>;
  }

  /**
   * db() - Konverterar Prisma IUserFull result till IUserWithRelations
   * Hanterar:
   * - Providers med nested tokens
   * - Applications
   * - Company
   * - Null/undefined hantering
   */
  static db(prismaUser: IUserFull): IUserWithRelations {
    const baseUser = this.base(prismaUser);

    const providers: IProviderDTO[] | undefined = prismaUser.providers?.map((p) => ({
      id: p.id,
      provider: p.provider as string,
      providerAccountId: p.providerAccountId,
      userId: p.userId,
      token: (p as any).token
        ? {
            id: (p as any).token.id,
            providerId: (p as any).token.providerId,
            access_token: (p as any).token.access_token,
            refresh_token: (p as any).token.refresh_token,
            expires_at: (p as any).token.expires_at,
            token_type: (p as any).token.token_type,
            scope: (p as any).token.scope,
            id_token: (p as any).token.id_token,
            session_state: (p as any).token.session_state,
          }
        : undefined,
    }));

    const applications: IApplicationDTO[] | undefined = prismaUser.applications?.map((app) => ({
      id: app.id,
      jobPostingId: app.jobPostingId,
      status: app.status,
      appliedAt: app.appliedAt,
      gotJob: app.gotJob,
    }));

    const company: ICompanyDTO | undefined = prismaUser.company
      ? {
          id: prismaUser.company.id,
          name: prismaUser.company.name,
          logo: prismaUser.company.logo ?? undefined,
        }
      : undefined;

    return {
      ...baseUser,
      providers,
      applications,
      company,
    };
  }
}
