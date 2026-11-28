import z from "zod";
import { ServerControllerSchema } from "../simple/server-controller-schema";

export const TMServerSchema = z.object({
  dediLogin: z.string().min(1, { message: "Dedi login is required" }),
  dediPassword: z.string().min(1, { message: "Dedi password is required" }),
  roomPassword: z.string().optional(),
  createServer: z.boolean(),
  groupId: z.string(),
  // Quick setup: create a group for the server when none is picked
  newGroup: z.boolean().optional(),
  updateServer: z.boolean(),
  serverId: z.string(),
  // Runs next to the new dedicated server, with its own local database
  serverController: ServerControllerSchema.optional(),
});

export type TMServerSchemaType = z.infer<typeof TMServerSchema>;
