import { redirect } from "next/navigation";

// The account page became the Profile page in V1; keep old links working.
export default function AccountPage() {
  redirect("/profile");
}
