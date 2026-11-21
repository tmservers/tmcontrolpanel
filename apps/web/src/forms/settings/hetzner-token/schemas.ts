import { z } from "zod";

export const AddHetznerTokenSchema = z.object({
  name: z.string().min(1, "Name is required"),
  token: z.string().min(1, "API token is required"),
});
export type AddHetznerTokenValues = z.infer<typeof AddHetznerTokenSchema>;

export const EditHetznerTokenSchema = z.object({
  name: z.string().min(1, "Name is required"),
  token: z.string(),
});
export type EditHetznerTokenValues = z.infer<typeof EditHetznerTokenSchema>;

export const ShareHetznerTokenSchema = z.object({
  groupIds: z.array(z.string()),
});
export type ShareHetznerTokenValues = z.infer<typeof ShareHetznerTokenSchema>;
