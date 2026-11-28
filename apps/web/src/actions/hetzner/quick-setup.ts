"use server";
import { doServerActionWithAuth } from "@/lib/actions";
import { axiosHetzner } from "@/lib/axios/hetzner";
import { HetznerLocationsResponse } from "@/types/api/hetzner/locations";
import { ServerError, ServerResponse } from "@/types/responses";

const HETZNER_TOKEN = /^[A-Za-z0-9]{32,128}$/;

// Checks a token before a project is saved, so a typo fails in the wizard and not later
export async function validateHetznerToken(
  token: string,
): Promise<ServerResponse<{ locations: number }>> {
  return doServerActionWithAuth(["hetzner:create"], async () => {
    const trimmed = typeof token === "string" ? token.trim() : "";
    if (!HETZNER_TOKEN.test(trimmed)) {
      throw new ServerError(
        "This doesn't look like a Hetzner API token.",
        "HetznerTokenInvalid",
      );
    }

    try {
      const res = await axiosHetzner.get<HetznerLocationsResponse>(
        "/locations",
        { headers: { Authorization: `Bearer ${trimmed}` } },
      );
      return { locations: res.data.locations.length };
    } catch (error) {
      const code = (error as { code?: string })?.code;
      throw new ServerError(
        code === "unauthorized"
          ? "Hetzner rejected this token."
          : "Could not reach Hetzner to check this token.",
        "HetznerTokenInvalid",
      );
    }
  });
}
