import { ParticipantRepoInput } from "../../repositories/repo-participant.repository";
import { RepoParticipantService } from "../repoParticipant/repo-participant.service";
import { AnalysedRepository, AnalyzedRepoInput } from "../../repositories/analysedRepo.repository";

export class AnalysedRepoService {
  private RepoParticipant: RepoParticipantService;
  private AnalysedRepository: AnalysedRepository;

  constructor() {
    this.RepoParticipant = new RepoParticipantService();
    this.AnalysedRepository = new AnalysedRepository();
  }

  async create(userId: string, analyse: AnalyzedRepoInput, participant: ParticipantRepoInput) {
    const resAnalyse = await this.AnalysedRepository.create(analyse);
    // Need to have analyse ID when adding a participant
    const resParticipant = await this.RepoParticipant.create(participant, resAnalyse.id, userId);

    return resParticipant;
  }
}
