import { getApiToken, setRateLimit } from "@/actions/hetzner/util";
import { doServerActionWithAuth } from "@/lib/actions";
import { axiosHetzner } from "@/lib/axios/hetzner";
import {
  HetznerServerLinks,
  LinkedHetznerServer,
  toLinkedHetznerServer,
} from "@/lib/hetzner-link";
import { getErrorMessage } from "@/lib/utils";
import { HetznerServersResponse } from "@/types/api/hetzner/servers";
import { ServerResponse } from "@/types/responses";
import "server-only";

const PER_PAGE = 50;
// Bounds the API calls one page view can spend from a project's rate limit
const MAX_PAGES = 5;

async function getAllProjectServers(project: {
  id: string;
  name: string;
}): Promise<LinkedHetznerServer[]> {
  const token = await getApiToken(project.id);
  const servers: LinkedHetznerServer[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await axiosHetzner.get<HetznerServersResponse>("/servers", {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, per_page: PER_PAGE },
    });
    await setRateLimit(project.id, res);

    servers.push(
      ...res.data.servers.map((s) => toLinkedHetznerServer(s, project)),
    );
    if (!res.data.meta.pagination.next_page) break;
  }

  return servers;
}

// Cloud servers of every Hetzner project the user is a member of, for linking to panel servers
export async function getHetznerServerLinks(): Promise<
  ServerResponse<HetznerServerLinks>
> {
  return doServerActionWithAuth([], async (session) => {
    const results = await Promise.all(
      session.user.projects.map(async (project) => {
        try {
          return { project, servers: await getAllProjectServers(project) };
        } catch (error) {
          return { project, error: getErrorMessage(error) };
        }
      }),
    );

    const links: HetznerServerLinks = { servers: [], errors: [] };
    for (const result of results) {
      if (result.servers) {
        links.servers.push(...result.servers);
      } else {
        links.errors.push({
          projectId: result.project.id,
          projectName: result.project.name,
          error: result.error ?? "Unknown error",
        });
      }
    }
    return links;
  });
}
