"use client";

import { setHetznerTokenGroups } from "@/actions/hetzner/tokens";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import { queryKeys } from "@/lib/api-client/query";
import { getErrorMessage } from "@/lib/utils";
import { ServerError } from "@/types/responses";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconShare } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ShareHetznerTokenSchema,
  type ShareHetznerTokenValues,
} from "./schemas";

type Group = { id: string; name: string };
export function ShareHetznerTokenForm({
  projectId,
  shareableGroups,
  currentGroups,
  onSuccess,
}: {
  projectId: string;
  shareableGroups: Group[];
  currentGroups: Group[];
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  // Current groups stay listed so the owner can unshare them, even without admin rights there
  const options = [
    ...shareableGroups,
    ...currentGroups.filter(
      (group) => !shareableGroups.some((g) => g.id === group.id),
    ),
  ];
  const form = useForm<ShareHetznerTokenValues>({
    resolver: zodResolver(ShareHetznerTokenSchema),
    defaultValues: { groupIds: currentGroups.map((group) => group.id) },
  });

  async function onSubmit(values: ShareHetznerTokenValues) {
    try {
      const { error } = await setHetznerTokenGroups(projectId, values.groupIds);
      if (error) throw new ServerError(error, "ShareHetznerTokenError");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hetznerTokens,
      });
      toast.success("Hetzner token sharing updated");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update token sharing", {
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
        <FormField
          control={form.control}
          name="groupIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Groups</FormLabel>
              <FormControl>
                <MultiSelect
                  aria-label="Groups"
                  options={options.map((group) => ({
                    label: group.name,
                    value: group.id,
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={
                    options.length > 0
                      ? "Select groups"
                      : "You don't administer any groups"
                  }
                />
              </FormControl>
              <FormDescription>
                You can share with groups you are an admin of, and remove any
                group.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || options.length === 0}
        >
          <IconShare />
          {form.formState.isSubmitting ? "Saving..." : "Save sharing"}
        </Button>
      </form>
    </Form>
  );
}
