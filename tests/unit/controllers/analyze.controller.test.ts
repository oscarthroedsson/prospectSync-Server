import { AnalyzeController } from "../../../src/controllers/analyze.controller";
import { Request, Response } from "express";

describe("AnalyzeController", () => {
  let controller: AnalyzeController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    controller = new AnalyzeController();
    mockRes = {
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("analyzeGithubRepo", () => {
    it("should return message", async () => {
      mockReq = {};

      await controller.analyzeGithubRepo(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({ message: "analyze job posting" });
    });
  });
});
