import { AuthGuard } from "~/components/auth-guard";

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
