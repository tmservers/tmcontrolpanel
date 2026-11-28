import { axiosHetzner } from "@/lib/axios/hetzner";
import { getHetznerProject } from "@/lib/hetzner";
import { logger } from "@/lib/logger";
import { getKeyHetznerRateLimit, getRedisClient } from "@/lib/redis";
import { assertNumericId } from "@/lib/resource-id";
import { generateSSHKeyPair } from "@/lib/ssh";
import { getList } from "@/lib/utils";
import {
  HetznerServer,
  HetznerServersResponse,
} from "@/types/api/hetzner/servers";
import {
  HetznerSSHKeyResponse,
  HetznerSSHKeysResponse,
} from "@/types/api/hetzner/ssh-keys";
import { ServerError } from "@/types/responses";
import { AxiosResponse } from "axios";
import "server-only";
import sshpk from "sshpk";

// Machines provisioned before the rename keep the old extract directory; new ones use the new one
export const HETZNER_DIR_SHELL =
  "$([ -d /root/tmcontrolpanel-master ] && echo /root/tmcontrolpanel-master || echo /root/gocontrolpanel-master)/hetzner";

export async function getApiToken(projectId: string): Promise<string> {
  const project = await getHetznerProject(projectId);
  const apiTokens = getList<string>(project?.apiTokens);

  if (apiTokens.length === 0) {
    throw new ServerError(
      "No API tokens found for the Hetzner project.",
      "HetznerApiTokenNotFound",
    );
  }

  return apiTokens[0];
}

export async function setRateLimit(projectId: string, res: AxiosResponse) {
  const redis = await getRedisClient();
  const rateLimit = res.headers["ratelimit-limit"];
  const rateLimitRemaining = res.headers["ratelimit-remaining"];

  if (rateLimit && rateLimitRemaining) {
    await redis.set(
      getKeyHetznerRateLimit(projectId),
      JSON.stringify({
        limit: rateLimit,
        remaining: rateLimitRemaining,
      }),
    );
  }
}

export async function getHetznerServers(
  projectId: string,
): Promise<HetznerServersResponse> {
  const token = await getApiToken(projectId);

  const res = await axiosHetzner.get<HetznerServersResponse>("/servers", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await setRateLimit(projectId, res);

  return res.data;
}

export async function getHetznerServer(
  projectId: string,
  serverId: number,
): Promise<HetznerServer> {
  assertNumericId(serverId);
  const token = await getApiToken(projectId);

  const res = await axiosHetzner.get<{
    server: HetznerServer;
  }>(`/servers/${serverId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await setRateLimit(projectId, res);

  return res.data.server;
}

// Best effort: removes the panel-generated key of a deleted server so keys don't pile up
export async function deleteHetznerSSHKeyByPublicKey(
  projectId: string,
  publicKey: string,
) {
  try {
    const fingerprint = sshpk
      .parseKey(publicKey, "ssh")
      .fingerprint("md5")
      .toString("hex");
    const token = await getApiToken(projectId);
    const headers = { Authorization: `Bearer ${token}` };
    const res = await axiosHetzner.get<HetznerSSHKeysResponse>("/ssh_keys", {
      headers,
      params: { fingerprint },
    });
    for (const key of res.data.ssh_keys) {
      assertNumericId(key.id);
      await axiosHetzner.delete(`/ssh_keys/${key.id}`, { headers });
    }
  } catch (error) {
    logger.warn(
      {
        meta: { module: "hetzner", function: "deleteHetznerSSHKeyByPublicKey" },
        error,
      },
      "Could not delete the server's Hetzner SSH key",
    );
  }
}

export async function createHetznerSSHKey(
  projectId: string,
  name: string,
): Promise<{
  id: number;
  publicKey: string;
  privateKey: string;
}> {
  const token = await getApiToken(projectId);

  const keys = generateSSHKeyPair();

  const res = await axiosHetzner.post<HetznerSSHKeyResponse>(
    "/ssh_keys",
    {
      name,
      public_key: keys.publicKey,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return {
    id: res.data.ssh_key.id,
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
  };
}
