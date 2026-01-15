"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepRepository = void 0;
exports.getStepRepository = getStepRepository;
const database_1 = require("../config/database");
class StepRepository {
    prisma;
    constructor() {
        this.prisma = (0, database_1.getPrismaClient)();
    }
    async getStepByID(stepID) {
        const step = await this.prisma.processStep.findUnique({
            where: { id: stepID },
        });
        if (!step) {
            return null;
        }
        return {
            id: step.id,
            processId: step.processId || undefined,
            name: step.name,
            status: step.status || undefined,
            order: step.order,
        };
    }
    async getActionsByStepID(stepID) {
        const actions = await this.prisma.actionDefinition.findMany({
            where: { stepId: stepID },
            orderBy: { order: "asc" },
        });
        return actions.map((action) => ({
            id: action.id,
            stepId: action.stepId,
            name: action.name,
            isPublic: action.isPublic,
            order: action.order,
            config: action.config,
        }));
    }
    async getUserEmailByStepID(stepID) {
        const userProcessStep = await this.prisma.userProcessStep.findFirst({
            where: { stepId: stepID },
            include: { user: true },
        });
        return userProcessStep?.user.email || null;
    }
}
exports.StepRepository = StepRepository;
let instance = null;
function getStepRepository() {
    if (!instance) {
        instance = new StepRepository();
    }
    return instance;
}
//# sourceMappingURL=step.repository.js.map