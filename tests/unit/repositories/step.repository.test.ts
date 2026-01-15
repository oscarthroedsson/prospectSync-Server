import { StepRepository } from "../../../src/repositories/step.repository";
import { getPrismaClient } from "../../../src/config/database";
import { mockPrismaClient } from "../../helpers/mocks";

jest.mock("../../../src/config/database", () => ({
  getPrismaClient: jest.fn(),
}));

describe("StepRepository", () => {
  let repository: StepRepository;

  beforeEach(() => {
    (getPrismaClient as jest.Mock).mockReturnValue(mockPrismaClient);
    repository = new StepRepository();
    jest.clearAllMocks();
  });

  describe("getStepByID", () => {
    it("should return step when found", async () => {
      const stepId = "step-1";
      const mockStep = {
        id: stepId,
        processId: "process-1",
        name: "Interview Scheduled",
        status: "in_progress",
        order: 1,
      };

      mockPrismaClient.processStep.findUnique.mockResolvedValue(mockStep);

      const result = await repository.getStepByID(stepId);

      expect(mockPrismaClient.processStep.findUnique).toHaveBeenCalledWith({
        where: { id: stepId },
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(stepId);
      expect(result?.name).toBe("Interview Scheduled");
    });

    it("should return null when step not found", async () => {
      mockPrismaClient.processStep.findUnique.mockResolvedValue(null);

      const result = await repository.getStepByID("non-existent");

      expect(result).toBeNull();
    });

    it("should handle nullable processId", async () => {
      const mockStep = {
        id: "step-1",
        processId: null,
        name: "Step",
        order: 1,
      };

      mockPrismaClient.processStep.findUnique.mockResolvedValue(mockStep);

      const result = await repository.getStepByID("step-1");

      expect(result?.processId).toBeUndefined();
    });
  });

  describe("getActionsByStepID", () => {
    it("should return actions ordered by order field", async () => {
      const stepId = "step-1";
      const mockActions = [
        {
          id: "action-1",
          stepId: stepId,
          name: "Action 1",
          isPublic: true,
          order: 1,
          config: { type: "SEND_EMAIL" },
        },
        {
          id: "action-2",
          stepId: stepId,
          name: "Action 2",
          isPublic: false,
          order: 2,
          config: { type: "WEBHOOK" },
        },
      ];

      mockPrismaClient.actionDefinition.findMany.mockResolvedValue(mockActions);

      const result = await repository.getActionsByStepID(stepId);

      expect(mockPrismaClient.actionDefinition.findMany).toHaveBeenCalledWith({
        where: { stepId },
        orderBy: { order: "asc" },
      });

      expect(result).toHaveLength(2);
      expect(result[0].order).toBe(1);
      expect(result[1].order).toBe(2);
    });

    it("should return empty array when no actions found", async () => {
      mockPrismaClient.actionDefinition.findMany.mockResolvedValue([]);

      const result = await repository.getActionsByStepID("step-1");

      expect(result).toEqual([]);
    });
  });

  describe("getUserEmailByStepID", () => {
    it("should return user email when found", async () => {
      const stepId = "step-1";
      const mockUserProcessStep = {
        user: {
          email: "user@example.com",
        },
      };

      mockPrismaClient.userProcessStep.findFirst.mockResolvedValue(mockUserProcessStep);

      const result = await repository.getUserEmailByStepID(stepId);

      expect(mockPrismaClient.userProcessStep.findFirst).toHaveBeenCalledWith({
        where: { stepId },
        include: { user: true },
      });

      expect(result).toBe("user@example.com");
    });

    it("should return null when no user found", async () => {
      mockPrismaClient.userProcessStep.findFirst.mockResolvedValue(null);

      const result = await repository.getUserEmailByStepID("step-1");

      expect(result).toBeNull();
    });
  });
});
