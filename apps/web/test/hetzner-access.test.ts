import { mergeHetznerProjectAccess } from "@/lib/hetzner-access";
import { describe, expect, it } from "vitest";

describe("mergeHetznerProjectAccess", () => {
  it("maps owned projects to Admin and group roles to their access level", () => {
    expect(
      mergeHetznerProjectAccess({
        direct: [],
        owned: [{ id: "owned", name: "Owned" }],
        groups: [
          { role: "Admin", projects: [{ id: "admin", name: "Admin" }] },
          {
            role: "Moderator",
            projects: [{ id: "moderator", name: "Moderator" }],
          },
          { role: "Member", projects: [{ id: "member", name: "Member" }] },
        ],
      }),
    ).toEqual([
      { id: "owned", name: "Owned", role: "Admin" },
      { id: "admin", name: "Admin", role: "Admin" },
      { id: "moderator", name: "Moderator", role: "Moderator" },
    ]);
  });

  it("keeps the highest role per project regardless of input order", () => {
    expect(
      mergeHetznerProjectAccess({
        direct: [{ id: "shared", name: "Direct", role: "Moderator" }],
        owned: [{ id: "owned", name: "Owned" }],
        groups: [
          { role: "Admin", projects: [{ id: "shared", name: "Group" }] },
          { role: "Moderator", projects: [{ id: "owned", name: "Group" }] },
        ],
      }),
    ).toEqual([
      { id: "shared", name: "Group", role: "Admin" },
      { id: "owned", name: "Owned", role: "Admin" },
    ]);
  });

  it("returns no projects for empty input", () => {
    expect(
      mergeHetznerProjectAccess({ direct: [], owned: [], groups: [] }),
    ).toEqual([]);
  });
});
