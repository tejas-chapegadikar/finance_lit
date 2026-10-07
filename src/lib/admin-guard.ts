import { requireAdmin } from "./auth";
import { adminActionRatelimit, isAllowed, TOO_MANY_REQUESTS } from "./ratelimit";

// Lives outside the "use server" action files on purpose: every export of
// those becomes a callable endpoint, and this is only a helper.
export async function guardAdminAction() {
  const admin = await requireAdmin();
  if (!(await isAllowed(adminActionRatelimit, admin.id))) {
    throw new Error(TOO_MANY_REQUESTS);
  }
  return admin;
}
