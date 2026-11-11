import { apiRoute } from "@/lib/api-route";
import { getTmeventsEvents } from "@/services/tmevents";

export const GET = apiRoute(() => getTmeventsEvents());
