import { DEFAULT_REPOPARTICIPANT_INCLUDES, ParticipantRepoInput, RepoParticipantRepository } from "../../repositories/repo-participant.repository";

export class RepoParticipantService {
  private repo: RepoParticipantRepository;

  constructor() {
    this.repo = new RepoParticipantRepository();
  }

  async create(
    participant: ParticipantRepoInput,
    analyseId: string,
    userId: string,
    config: typeof DEFAULT_REPOPARTICIPANT_INCLUDES = DEFAULT_REPOPARTICIPANT_INCLUDES,
  ) {
    const res = await this.repo.create(participant, analyseId, userId, config);
    return res;
  }
}
