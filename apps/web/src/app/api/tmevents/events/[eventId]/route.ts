import { apiRoute, parse } from "@/lib/api-route";
import { getTmeventsEventData } from "@/services/tmevents";
import { z } from "zod";

export const GET = apiRoute<{ eventId: string }>(({ params }) =>
  getTmeventsEventData(parse(z.string().min(1).max(200), params.eventId)),
);
