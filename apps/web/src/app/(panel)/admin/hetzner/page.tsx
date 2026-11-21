import { routes } from "@/routes";
import { redirect } from "next/navigation";

// Hetzner projects now live in a tab on the servers page
export default function AdminHetznerPage() {
  redirect(routes.admin.hetzner);
}
