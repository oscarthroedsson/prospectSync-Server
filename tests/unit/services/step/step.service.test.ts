import { StepService } from "../../../../src/services/step/step.service";
import { getStepRepository } from "../../../../src/repositories/step.repository";

jest.mock("../../../../src/repositories/step.repository");

describe("StepService", () => {
  let service: StepService;
  const mockStepRepository = {
    getStepByID: jest.fn(),
    getActionsByStepID: jest.fn(),
  };

  beforeEach(() => {
    (getStepRepository as jest.Mock).mockReturnValue(mockStepRepository);
    service = new StepService();
    jest.clearAllMocks();
  });

  describe("getStepWithActions", () => {
    it("should return step with actions", async () => {
      const stepId = "step-1";
      const mockStep = {
        id: stepId,
        name: "Interview Scheduled",
        status: "in_progress",
        order: 1,
      };
      const mockActions = [
        {
          id: "action-1",
          stepId: stepId,
          name: "Send Email",
          isPublic: true,
          order: 1,
          config: {
            _raw: JSON.stringify({ type: "SEND_EMAIL", to: "CUSTOM" }),
          },
        },
      ];

      mockStepRepository.getStepByID.mockResolvedValue(mockStep);
      mockStepRepository.getActionsByStepID.mockResolvedValue(mockActions);

      const result = await service.getStepWithActions(stepId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(stepId);
      expect(result?.actions).toHaveLength(1);
      expect(result?.actions?.[0].config.type).toBe("SEND_EMAIL");
      expect(result?.actions?.[0].config._raw).toBeUndefined();
    });

    it("should return null when step not found", async () => {
      mockStepRepository.getStepByID.mockResolvedValue(null);

      const result = await service.getStepWithActions("non-existent");

      expect(result).toBeNull();
    });

    it("should parse action configs correctly", async () => {
      const stepId = "step-1";
      const mockStep = { id: stepId, name: "Step", order: 1 };
      const mockActions = [
        {
          id: "action-1",
          stepId: stepId,
          name: "Action",
          isPublic: true,
          order: 1,
          config: { _raw: JSON.stringify({ type: "WEBHOOK", url: "https://example.com" }) },
        },
      ];

      mockStepRepository.getStepByID.mockResolvedValue(mockStep);
      mockStepRepository.getActionsByStepID.mockResolvedValue(mockActions);

      const result = await service.getStepWithActions(stepId);

      expect(result?.actions?.[0].config.type).toBe("WEBHOOK");
      expect(result?.actions?.[0].config.url).toBe("https://example.com");
    });
  });
});
