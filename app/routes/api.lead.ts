import type { ActionFunctionArgs } from "@remix-run/node";
import { handleLead } from "~/lib/lead.server";
import { methodNotAllowed } from "~/lib/integrations.server";

export const loader = methodNotAllowed;
export const action = ({ request }: ActionFunctionArgs) => handleLead(request);
