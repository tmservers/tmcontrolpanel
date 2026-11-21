"use client";

import { updateHetznerToken } from "@/actions/hetzner/tokens";
import FormElement from "@/components/form/form-element";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { queryKeys } from "@/lib/api-client/query";
import { getErrorMessage } from "@/lib/utils";
import { ServerError } from "@/types/responses";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EditHetznerTokenSchema, type EditHetznerTokenValues } from "./schemas";

export function EditHetznerTokenForm({
  projectId,
  name,
  onSuccess,
}: {
  projectId: string;
  name: string;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<EditHetznerTokenValues>({
    resolver: zodResolver(EditHetznerTokenSchema),
    defaultValues: { name, token: "" },
  });

  async function onSubmit(values: EditHetznerTokenValues) {
    try {
      const { error } = await updateHetznerToken(projectId, {
        name: values.name,
        ...(values.token ? { token: values.token } : {}),
      });
      if (error) throw new ServerError(error, "UpdateHetznerTokenError");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hetznerTokens,
      });
      toast.success("Hetzner token updated");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update Hetzner token", {
        description: getErrorMessage(error),
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormElement<EditHetznerTokenValues>
          name="name"
          label="Project name"
          isRequired
        />
        <FormElement<EditHetznerTokenValues>
          name="token"
          label="Replace API token"
          type="password"
          placeholder="Leave empty to keep the current token"
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
