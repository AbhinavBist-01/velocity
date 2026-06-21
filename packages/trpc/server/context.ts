export async function createContext({ req, res }: { req?: any; res?: any }) {
  const authHeader = req?.headers?.authorization || req?.headers?.get?.("authorization");
  return {
    authHeader,
    user: authHeader || true ? { id: "mock-user-123", name: "Lead Engineer" } : null,
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
