"use client";

import { addHetznerToken } from "@/actions/hetzner/tokens";
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
import { AddHetznerTokenSchema, type AddHetznerTokenValues } from "./schemas";

export function AddHetznerTokenForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<AddHetznerTokenValues>({
    resolver: zodResolver(AddHetznerTokenSchema),
    defaultValues: { name: "", token: "" },
  });

  async function onSubmit(values: AddHetznerTokenValues) {
    try {
      const { error } = await addHetznerToken(values);
      if (error) throw new ServerError(error, "AddHetznerTokenError");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hetznerTokens,
      });
      toast.success("Hetzner token added");
      onSuccess();
    } catch (error) {
      toast.error("Failed to add Hetzner token", {
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
        <FormElement<AddHetznerTokenValues>
          name="name"
          label="Project name"
          placeholder="My Hetzner project"
          isRequired
        />
        <FormElement<AddHetznerTokenValues>
          name="token"
          label="API token"
          type="password"
          placeholder="Enter API token"
          isRequired
        />
        <p className="text-sm text-muted-foreground">
          Create a Read &amp; Write token under Security → API tokens in{" "}
          <a
            className="underline"
            href="https://console.hetzner.com/projects"
            target="_blank"
            rel="noreferrer"
          >
            Hetzner Cloud Console
          </a>
          .
        </p>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Adding…" : "Add token"}
        </Button>
      </form>
    </Form>
  );
}
