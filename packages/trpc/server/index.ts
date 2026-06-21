import { router } from "./trpc";

import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { shipflowRouter } from "./routes/shipflow/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  shipflow: shipflowRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
