import type { IJobPostingFull } from "../../repositories/job-posting.repository";
import type {
  IJobPostingDTO,
  IJobPostingCreateDTO,
  IJobPostingUpdateDTO,
  IPreferenceSetDTO,
} from "../../Types/job-postingt.types";

export class JobPostingMapper {
  /**
   * base() - Konverterar IJobPostingDTO till ett normalt objekt
   * Används för normal visning/hantering
   */
  static base(dto: IJobPostingDTO): IJobPostingDTO {
    return dto;
  }

  /**
   * create() - Skapar en IJobPostingCreateDTO från external data (t.ex. AI/scraping)
   * Lägger till metadata som timestamps och createdJobPosting
   */
  static create(data: any, url: string, createdById?: string): IJobPostingCreateDTO {
    const today = new Date().toISOString();

    return {
      ...data,
      jobPostingUrl: url,
      createdAt: today,
      updatedAt: today,
      createdJobPosting: {
        createdByType: "system",
        createdById: createdById,
        source: "url",
        importedAt: today,
      },
    };
  }

  /**
   * update() - Förbereder partial data för update-operationer
   * Filtrerar bort undefined values och lägger till updatedAt
   */
  static update(data: Partial<IJobPostingDTO>): IJobPostingUpdateDTO {
    const updateData: IJobPostingUpdateDTO = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Filtrera bort undefined values
    return Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    ) as IJobPostingUpdateDTO;
  }

  /**
   * db() - Konverterar Prisma result till IJobPostingDTO
   * Hanterar:
   * - PreferenceSet[0] (första array-item är sanningen)
   * - Nested relations (languages, locations, etc.)
   * - Date → ISO string konvertering
   * - Null/undefined hantering
   */
  static db(prisma: IJobPostingFull): IJobPostingDTO {
    // Ta första PreferenceSet (enligt din business logic)
    const firstPrefSet = prisma.preferenceSet?.[0];

    const preferenceSet: IPreferenceSetDTO | undefined = firstPrefSet
      ? {
          id: firstPrefSet.id,
          userId: firstPrefSet.userId,
          jobPostingId: firstPrefSet.jobPostingId,
          createdAt: firstPrefSet.createdAt,
          updatedAt: firstPrefSet.updatedAt,

          languages:
            firstPrefSet.languages?.map((l) => ({
              id: l.id,
              language: l.language,
              level: l.level,
              isNative: l.isNative,
              preferenceSetId: l.preferenceSetId,
            })) ?? [],

          locations:
            firstPrefSet.locations?.map((loc) => ({
              id: loc?.id ?? "",
              city: loc.city,
              region: loc.region,
              country: loc.country,
              isRemote: loc.isRemote,
              lat: loc.lat,
              lng: loc.lng,
              preferenceSetId: loc.preferenceSetId,
            })) ?? [],

          workArrangements:
            firstPrefSet.workArrangements?.map((wa) => ({
              id: wa.id,
              mode: wa.mode,
              preferenceSetId: wa.preferenceSetId,
            })) ?? [],

          employmentTypes:
            firstPrefSet.employmentTypes?.map((et) => ({
              id: et.id,
              type: et.type,
              preferenceSetId: et.preferenceSetId,
            })) ?? [],

          salaries:
            firstPrefSet.salaries?.map((s) => ({
              id: s.id,
              minAmount: s.minAmount,
              maxAmount: s.maxAmount,
              currency: s.currency,
              period: s.period,
              notes: s.notes,
              preferenceSetId: s.preferenceSetId,
            })) ?? [],

          benefits:
            firstPrefSet.benefits?.map((b) => ({
              id: b.id,
              name: b.name,
              description: b.description,
              preferenceSetId: b.preferenceSetId,
            })) ?? [],

          requirements:
            firstPrefSet.requirements?.map((r) => ({
              id: r.id,
              requirement: r.requirement,
              preferenceSetId: r.preferenceSetId,
            })) ?? [],

          merits:
            firstPrefSet.merits?.map((m) => ({
              id: m.id,
              merit: m.merit,
              preferenceSetId: m.preferenceSetId,
            })) ?? [],

          applicantQualities:
            firstPrefSet.applicantQualities?.map((aq) => ({
              id: aq.id,
              quality: aq.quality,
              preferenceSetId: aq.preferenceSetId,
            })) ?? [],
        }
      : undefined;

    return {
      id: prisma.id,
      title: prisma.title,
      companyName: prisma.companyName,
      companyLogo: prisma.companyLogo,
      jobPostingUrl: prisma.jobPostingUrl,
      jobDescription: prisma.jobDescription,
      markdownText: prisma.markdownText,
      status: prisma.status,
      endsAt: prisma.endsAt,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,

      preferenceSet,

      createdJobPosting: prisma.createdJobPosting
        ? {
            id: prisma.createdJobPosting.id,
            jobPostingId: prisma.createdJobPosting.jobPostingId,
            createdByType: prisma.createdJobPosting.createdByType,
            createdById: prisma.createdJobPosting.createdById,
            source: prisma.createdJobPosting.source,
            importedAt: prisma.createdJobPosting.importedAt,
          }
        : null,

      company: prisma.company
        ? {
            id: prisma.company.id,
            name: prisma.company.name,
            logo: prisma.company.logo,
          }
        : null,

      jobApplicants: prisma.jobApplicants?.map((ja) => ({
        id: ja.id,
        userId: ja.userId,
        jobPostingId: ja.jobPostingId,
        appliedAt: ja.appliedAt,
      })),

      userProcesses: prisma.userProcesses?.map((up) => ({
        id: up.id,
        userId: up.userId,
        jobPostingId: up.jobPostingId,
        status: up.status,
        updatedAt: up.updatedAt,
      })),
    };
  }
}
