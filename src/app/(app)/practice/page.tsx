import { redirect } from "next/navigation";

// Practice now lives inside Learn — the daily question and challenge,
// revision and the money scenarios are its "Practise & revise" sections.
// Old links land there. (Individual scenarios still open at /practice/[slug].)
export default function PracticePage() {
  redirect("/lessons#practise");
}
