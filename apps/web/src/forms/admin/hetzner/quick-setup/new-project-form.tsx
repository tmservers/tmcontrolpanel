"use client";

import { createHetznerProject } from "@/actions/database/hetzner-projects";
import { validateHetznerToken } from "@/actions/hetzner/quick-setup";
import FormElement from "@/components/form/form-element";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { unwrap } from "@/lib/api-client/query";
import { getErrorMessage } from "@/lib/utils";
import { ServerError } from "@/types/responses";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowNarrowRight, IconLoader2 } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { HetznerProjectRole } from "@tmcontrolpanel/db";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const NewProjectSchema = z.object({
  token: z.string().trim().min(1, "API token is required"),
  name: z.string().trim().min(1, "Project name is required"),
});

type NewProjectSchemaType = z.infer<typeof NewProjectSchema>;

export default function NewProjectForm({
  onCreated,
}: {
  onCreated: (projectId: string) => void;
}) {
  const { data: session, update } = useSession();

  const form = useForm<NewProjectSchemaType>({
    resolver: zodResolver(NewProjectSchema),
    defaultValues: { token: "", name: "My Trackmania servers" },
  });

  const validation = useMutation({
    mutationFn: (token: string) =>
      unwrap(validateHetznerToken(token), "ValidateHetznerTokenError"),
  });

  // A result only counts for the token that is still in the field
  const checked = validation.variables === form.watch("token").trim();
  const valid = checked && validation.isSuccess;

  const validate = () => {
    const token = form.getValues("token").trim();
    if (!token) return;
    if (validation.variables === token && !validation.isError) return;
    validation.mutate(token);
  };

  async function onSubmit(values: NewProjectSchemaType) {
    if (!session || !valid) {
      validate();
      return;
    }
    try {
      const { data, error } = await createHetznerProject({
        name: values.name,
        apiTokens: [values.token],
        hetznerProjectUsers: [
          { userId: session.user.id, role: HetznerProjectRole.Admin },
        ],
      });
      if (error) {
        throw new ServerError(error, "CreateHetznerProjectError");
      }
      await update();
      toast.success("Project successfully created");
      onCreated(data.id);
    } catch (error) {
      toast.error("Failed to create project", {
        description: getErrorMessage(error),
      });
    }
  }

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2 rounded-md border bg-muted/50 p-4 text-sm">
          <h3 className="font-semibold">Get an API token (takes 1 minute)</h3>
          <ol className="flex list-decimal flex-col gap-1 pl-4 text-muted-foreground">
            <li>
              Open the{" "}
              <a
                href="https://console.hetzner.com/projects"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                Hetzner Cloud Console
              </a>{" "}
              and create a project.
            </li>
            <li>
              Go to Security → API tokens → Generate with{" "}
              <strong className="text-foreground">Read &amp; Write</strong>{" "}
              access.
            </li>
            <li>Paste the token below.</li>
          </ol>
        </div>

        <div
          className="flex flex-col gap-2"
          onBlur={validate}
          // The field only holds the pasted value after this event
          onPaste={() => setTimeout(validate)}
        >
          <FormElement
            name="token"
            label="API token"
            placeholder="Paste your API token"
            type="password"
            rootClassName="max-w-full"
            isRequired
          />
          <p role="status" className="text-xs">
            {checked && validation.isPending && (
              <span className="text-muted-foreground">Checking token...</span>
            )}
            {valid && (
              <span className="text-primary">
                Token works. {validation.data.locations} locations are
                available.
              </span>
            )}
            {checked && validation.isError && (
              <span className="text-destructive">
                {getErrorMessage(validation.error)}
              </span>
            )}
          </p>
        </div>

        <FormElement
          name="name"
          label="Project name"
          description="Only used in the panel. You can add users and more tokens later."
          rootClassName="max-w-full"
          isRequired
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={!valid || isSubmitting}>
            Continue
            {isSubmitting ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              <IconArrowNarrowRight />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
