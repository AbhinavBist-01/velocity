import UserService from "@repo/services/user";
import { shipFlowService } from "@repo/services/shipflow";

export const userService = new UserService();
export const shipflowService = shipFlowService;
