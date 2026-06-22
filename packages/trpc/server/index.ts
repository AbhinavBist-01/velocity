import { router } from "./trpc";

import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { velocityRouter } from "./routes/velocity/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  velocity: velocityRouter,
});

export { createContext } from "./context";
export { userService } from "./services";
export type ServerRouter = typeof serverRouter;
