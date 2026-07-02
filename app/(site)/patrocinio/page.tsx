import { redirect } from "next/navigation";

/** Legacy Spanish URL — permanent redirect to /sponsoring. */
export default function PatrocinioRedirectPage() {
  redirect("/sponsoring");
}
