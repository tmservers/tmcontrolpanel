import { apiRoute } from "@/lib/api-route";
import { getTmeventsStatus } from "@/services/tmevents";

export const GET = apiRoute(() => getTmeventsStatus());
