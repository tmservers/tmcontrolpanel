"use client";

import {
  addTrackmaniaServer,
  createSimpleServerSetup,
} from "@/actions/hetzner/server-setup";
import FormElement from "@/components/form/form-element";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServerControllerFields } from "@/forms/admin/hetzner/setup-steps/simple/server-controller-form";
import {
  useHetznerLocations,
  useHetznerServerTypes,
} from "@/hooks/use-hetzner-queries";
import { usePaginationAPI } from "@/hooks/use-pagination-api";
import { queryKeys } from "@/lib/api-client/query";
import { parseTmTags } from "@/lib/tmtags";
import { cn, getErrorMessage, hasPermissionSync } from "@/lib/utils";
import { routes } from "@/routes";
import type { HetznerProjectListItem } from "@/services/database/hetzner-projects";
import type { HetznerServer } from "@/types/api/hetzner/servers";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DeployWizardSchema, DeployWizardValues } from "./deploy-wizard-schema";

const radioCard =
  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5";

export default function DeployWizardForm({
  canAddToken,
  closeModal,
  onSubmit,
}: {
  canAddToken: boolean;
  closeModal?: () => void;
  onSubmit?: () => void;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"token" | "where" | "server">("token");
  const [projectId, setProjectId] = useState("");
  const [mode, setMode] = useState<"new" | "existing">("new");
  const projectsQuery = usePaginationAPI<HetznerProjectListItem>(
    "/api/hetzner/projects",
    { pageIndex: 0, pageSize: 100 },
    { field: "name", order: "asc" },
  );
  const projects = projectsQuery.data.filter(
    (project) =>
      session?.user.projects.find((p) => p.id === project.id)?.role === "Admin",
  );
  const project = projects.find((p) => p.id === projectId);
  const serverTypesQuery = useHetznerServerTypes(projectId);
  const locationsQuery = useHetznerLocations(projectId);
  const serversQuery = usePaginationAPI<HetznerServer>(
    `/api/hetzner/${encodeURIComponent(projectId)}/servers`,
    { pageIndex: 0, pageSize: 50 },
    { field: "id", order: "asc" },
    "",
    {},
    !!projectId,
  );
  const dedicatedServers = serversQuery.data.filter(
    (server) => server.labels.type === "dedi",
  );
  const form = useForm<DeployWizardValues>({
    resolver: zodResolver(DeployWizardSchema),
    mode: "onChange",
    defaultValues: {
      mode: "new",
      name: "",
      serverType: "",
      location: "",
      dediLogin: "",
      dediPassword: "",
      roomPassword: "",
      groupId: "",
    } as DeployWizardValues,
  });
  const locations = locationsQuery.data ?? [];
  const serverTypes = serverTypesQuery.data ?? [];
  const groups = useMemo(() => {
    const available = [
      ...(session?.user.groups ?? []),
      ...(session?.user.adminGroups ?? []),
    ];
    const unique = [
      ...new Map(available.map((group) => [group.id, group])).values(),
    ];
    return unique.filter((group) =>
      hasPermissionSync(session, ["groups:edit", "groups:id:admin"], group.id),
    );
  }, [session]);
  const setNewDefault = (field: "serverType" | "location") => {
    if (field === "serverType" && !form.getValues("serverType")) {
      const preferred =
        serverTypes.find((type) => type.name === "cpx11") ?? serverTypes[0];
      if (preferred) form.setValue("serverType", String(preferred.id));
    }
    if (field === "location" && !form.getValues("location")) {
      const preferred =
        locations.find((location) => location.name === "fsn1") ?? locations[0];
      if (preferred) form.setValue("location", preferred.name);
    }
  };
  const availableSharedGroups =
    project?.groupHetznerProjects
      .map((entry) => entry.group)
      .filter((group) =>
        groups.some((candidate) => candidate.id === group.id),
      ) ?? [];
  const selectedType = serverTypes.find(
    (type) => String(type.id) === form.watch("serverType"),
  );
  const selectedLocation = form.watch("location");
  const pricing =
    selectedType?.prices.find((price) => price.location === selectedLocation) ??
    selectedType?.prices.find((price) => price.location === "fsn1");

  async function submit(values: DeployWizardValues) {
    try {
      const response =
        values.mode === "new"
          ? await createSimpleServerSetup(projectId, {
              server: {
                name: values.name,
                serverType: values.serverType,
                location: values.location,
                sshKeys: [],
                dediLogin: values.dediLogin,
                dediPassword: values.dediPassword,
                roomPassword: values.roomPassword,
                controller: !!values.controller,
              },
              // The controller's database runs on the same machine, so no extra server is rented
              ...(values.controller && {
                serverController: values.serverController,
                database: { new: true, local: true },
              }),
              createServer: true,
              updateServer: false,
              groupId: values.groupId ?? "",
              serverId: "",
            })
          : await addTrackmaniaServer(projectId, values.hetznerServerId, {
              dediLogin: values.dediLogin,
              dediPassword: values.dediPassword,
              roomPassword: values.roomPassword,
              createServer: true,
              updateServer: false,
              groupId: values.groupId ?? "",
              serverId: "",
            });
      if (response.error) throw new Error(response.error);
      toast.success(
        values.mode === "new"
          ? "Server deployment started"
          : "Trackmania server added",
      );
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hetznerServerLinks,
      });
      onSubmit?.();
      closeModal?.();
    } catch (error) {
      toast.error("Deployment failed", { description: getErrorMessage(error) });
    }
  }

  // A machine picked under another token would deploy to the wrong project
  const selectProject = (id: string) => {
    if (id === projectId) return;
    setProjectId(id);
    setMode("new");
    form.resetField("hetznerServerId" as never);
  };

  const nextFromToken = () => projectId && setStep("where");
  const nextFromWhere = () => {
    form.setValue("mode", mode);
    if (mode === "new") setNewDefault("serverType");
    if (mode === "new") setNewDefault("location");
    const onlyShared =
      availableSharedGroups.length === 1 ? availableSharedGroups[0] : undefined;
    if (onlyShared && !form.getValues("groupId"))
      form.setValue("groupId", onlyShared.id);
    setStep("server");
  };
  const controller = mode === "new" && form.watch("controller" as never);

  const nextStep = async () => {
    const valid = await form.trigger(
      mode === "new"
        ? [
            "name",
            "serverType",
            "location",
            "dediLogin",
            "dediPassword",
            ...(controller ? (["serverController"] as const) : []),
          ]
        : ["dediLogin", "dediPassword", "hetznerServerId"],
    );
    if (valid) await form.handleSubmit((values) => submit(values))();
  };

  return (
    <Tabs value={step} onValueChange={() => {}} className="w-full gap-4">
      <TabsList className="w-full">
        <TabsTrigger value="token" className="cursor-default">
          Token
        </TabsTrigger>
        <TabsTrigger value="where" className="cursor-default">
          Where
        </TabsTrigger>
        <TabsTrigger value="server" className="cursor-default">
          Server
        </TabsTrigger>
      </TabsList>
      <TabsContent value="token" className="space-y-4">
        {projectsQuery.loading && (
          <p className="text-muted-foreground">Loading projects…</p>
        )}
        {projectsQuery.error && (
          <p role="alert">
            Could not load Hetzner projects:{" "}
            {getErrorMessage(projectsQuery.error)}
          </p>
        )}
        {!projectsQuery.loading &&
          !projectsQuery.error &&
          projects.length === 0 &&
          (canAddToken ? (
            <p>
              No Hetzner project is available.{" "}
              <Link className="underline" href={routes.settings}>
                Add a Hetzner API token in settings
              </Link>
              .
            </p>
          ) : (
            <p>Ask a group admin to share a Hetzner token with your group.</p>
          ))}
        <div className="space-y-2">
          {projects.map((item) => (
            <label className={radioCard} key={item.id}>
              <input
                aria-label={`Select ${item.name}`}
                type="radio"
                name="project"
                checked={projectId === item.id}
                onChange={() => selectProject(item.id)}
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{item.name}</span>
                <span
                  className="block text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: parseTmTags(item.owner?.nickName ?? ""),
                  }}
                />
                {item.groupHetznerProjects.length > 0 && (
                  <span className="mt-2 flex flex-wrap gap-1">
                    {item.groupHetznerProjects.map(({ group }) => (
                      <span
                        key={group.id}
                        className="rounded bg-muted px-2 py-0.5 text-xs"
                      >
                        {group.name}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={nextFromToken} disabled={!projectId}>
            Next <IconArrowNarrowRight />
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="where" className="space-y-4">
        <div className="space-y-2">
          <label className={radioCard}>
            <input
              type="radio"
              name="deploy-mode"
              checked={mode === "new"}
              onChange={() => setMode("new")}
            />
            <span>
              <strong className="block">New Hetzner server</strong>
              <span className="text-sm text-muted-foreground">
                Rents a new cloud server in your Hetzner account; Hetzner bills
                you for it.
              </span>
            </span>
          </label>
          <label
            className={`${radioCard} ${dedicatedServers.length === 0 ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input
              type="radio"
              name="deploy-mode"
              checked={mode === "existing"}
              disabled={dedicatedServers.length === 0}
              onChange={() => setMode("existing")}
            />
            <span>
              <strong className="block">Existing Hetzner server</strong>
              <span className="text-sm text-muted-foreground">
                Runs another Trackmania server on a machine the panel already
                set up; no extra Hetzner cost.
              </span>
              {dedicatedServers.length === 0 && (
                <span className="mt-1 block text-sm">
                  No configured machines are available in this project.
                </span>
              )}
            </span>
          </label>
        </div>
        {mode === "existing" &&
          (serversQuery.loading ? (
            <p>Loading machines…</p>
          ) : serversQuery.error ? (
            <p role="alert">
              Could not load machines: {getErrorMessage(serversQuery.error)}
            </p>
          ) : (
            <div className="space-y-2">
              {dedicatedServers.map((server) => (
                <label className={radioCard} key={server.id}>
                  <input
                    type="radio"
                    name="machine"
                    checked={form.watch("hetznerServerId") === server.id}
                    onChange={() => form.setValue("hetznerServerId", server.id)}
                  />
                  <span>
                    <strong className="block">{server.name}</strong>
                    <span className="text-sm text-muted-foreground">
                      {server.status} ·{" "}
                      {server.public_net.ipv4?.ip ?? "No IPv4"} ·{" "}
                      {
                        Object.keys(server.labels).filter((key) =>
                          /^(\d+)\.version$/.test(key),
                        ).length
                      }{" "}
                      Trackmania servers
                    </span>
                  </span>
                </label>
              ))}
            </div>
          ))}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("token")}
          >
            <IconArrowNarrowLeft /> Back
          </Button>
          <Button
            type="button"
            onClick={nextFromWhere}
            disabled={
              mode === "existing" &&
              (!form.watch("hetznerServerId") || serversQuery.loading)
            }
          >
            Next <IconArrowNarrowRight />
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="server">
        {mode === "new" &&
        (serverTypesQuery.isPending || locationsQuery.isPending) ? (
          <p>Loading server types and locations…</p>
        ) : null}
        {mode === "new" && (serverTypesQuery.error || locationsQuery.error) && (
          <p role="alert">
            Could not load Hetzner options:{" "}
            {getErrorMessage(serverTypesQuery.error ?? locationsQuery.error)}
          </p>
        )}
        <Form {...form}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void nextStep();
            }}
            className="flex flex-col gap-4"
          >
            <div
              className={cn(
                "grid gap-4",
                mode === "new" && "md:grid-cols-2 md:gap-8",
              )}
            >
              {mode === "new" && (
                <div className="flex flex-col gap-4">
                  <FormElement name="name" label="Server name" isRequired />
                  <FormElement
                    name="serverType"
                    label="Server type"
                    type="select"
                    placeholder="Select server type"
                    options={serverTypes.map((type) => ({
                      value: String(type.id),
                      label: type.name,
                    }))}
                    isLoading={serverTypesQuery.isPending}
                    isRequired
                  />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <strong>Cores</strong>
                      <div>{selectedType?.cores ?? "-"}</div>
                    </div>
                    <div>
                      <strong>Memory</strong>
                      <div>
                        {selectedType ? `${selectedType.memory} GB` : "-"}
                      </div>
                    </div>
                    <div>
                      <strong>Disk</strong>
                      <div>
                        {selectedType ? `${selectedType.disk} GB` : "-"}
                      </div>
                    </div>
                    <div>
                      <strong>Monthly price</strong>
                      <div>
                        {pricing
                          ? `€${parseFloat(pricing.price_monthly.gross).toFixed(2)}`
                          : "-"}
                      </div>
                    </div>
                  </div>
                  <FormElement
                    name="location"
                    label="Location"
                    type="select"
                    placeholder="Select location"
                    options={locations.map((location) => ({
                      value: location.name,
                      label: location.description,
                    }))}
                    isLoading={locationsQuery.isPending}
                    isRequired
                  />
                </div>
              )}
              <div className="flex flex-col gap-4">
                <FormElement
                  name="dediLogin"
                  label="Trackmania server login"
                  isRequired
                />
                <FormElement
                  name="dediPassword"
                  label="Trackmania server password"
                  type="password"
                  isRequired
                />
                <FormElement name="roomPassword" label="Room password" />
                <FormElement
                  name="groupId"
                  label="Add to group"
                  type="select"
                  placeholder="No group"
                  options={groups.map((group) => ({
                    value: group.id,
                    label: group.name,
                  }))}
                />
                {mode === "new" && (
                  <>
                    <FormElement
                      name="controller"
                      label="Add a server controller"
                      type="checkbox"
                      description="Installs a controller with its own database on the same server."
                    />
                    {controller && <ServerControllerFields />}
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Provisioning takes a few minutes.
            </p>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("where")}
              >
                <IconArrowNarrowLeft /> Back
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  (mode === "new" &&
                    (serverTypesQuery.isPending || locationsQuery.isPending))
                }
              >
                {form.formState.isSubmitting
                  ? "Deploying…"
                  : mode === "new"
                    ? "Deploy server"
                    : "Add Trackmania server"}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
