import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { HomeClient } from "@/components/HomeClient";

export default async function Home() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  return <HomeClient userEmail={session?.user?.email ?? undefined} />;
}
