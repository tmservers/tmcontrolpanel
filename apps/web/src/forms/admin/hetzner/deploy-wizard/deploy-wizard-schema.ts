import { hetznerServerNameSchema } from "@/forms/admin/hetzner/server/add-hetzner-server-schema";
import { ServerControllerSchema } from "@/forms/admin/hetzner/setup-steps/simple/server-controller-schema";
import { z } from "zod";

const sharedFields = {
  dediLogin: z.string().min(1, "Trackmania server login is required"),
  dediPassword: z.string().min(1, "Trackmania server password is required"),
  roomPassword: z.string().optional(),
  groupId: z.string(),
};

export const DeployWizardSchema = z
  .discriminatedUnion("mode", [
    z.object({
      mode: z.literal("new"),
      name: hetznerServerNameSchema,
      serverType: z.string().min(1, "Server type is required"),
      location: z.string().min(1, "Location is required"),
      // Adding to an existing machine can't install a controller, so only new servers offer one
      controller: z.boolean().optional(),
      serverController: ServerControllerSchema.optional(),
      ...sharedFields,
    }),
    z.object({
      mode: z.literal("existing"),
      hetznerServerId: z.number(),
      ...sharedFields,
    }),
  ])
  .superRefine((values, ctx) => {
    if (
      values.mode === "new" &&
      values.controller &&
      !values.serverController
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a server controller",
        path: ["serverController", "type"],
      });
    }
  });

export type DeployWizardValues = z.infer<typeof DeployWizardSchema>;
