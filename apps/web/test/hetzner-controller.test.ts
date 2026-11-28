import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { HandlebarsServer } from "../src/lib/handlebars";
import { controllerForProvisioning } from "../src/lib/hetzner-controller";

const template = (name: string) =>
  HandlebarsServer.compile(
    readFileSync(path.join(__dirname, "../hetzner", name), "utf-8"),
  );

const base = {
  stack_name: "stack-1",
  dedi_login: "login",
  dedi_password: "pw",
};
const db = {
  type: "mysql",
  host: "mysql",
  port: 3306,
  name: "controller",
  user: "u",
  password: "p",
  root_password: "r",
  local: true,
};

describe("controllerForProvisioning", () => {
  const mini = {
    type: "minicontrol",
    admins: [],
    excludedPlugins: [],
    contactInfo: "me",
    identifier: "",
    secret: "",
  };

  it("excludes worldrecords when MiniControl has no API credentials", () => {
    expect(controllerForProvisioning(mini)?.excludedPlugins).toEqual([
      "tm2020/worldrecords",
    ]);
  });

  it("keeps the plugin when credentials are set", () => {
    const withCreds = { ...mini, identifier: "id", secret: "s" };
    expect(controllerForProvisioning(withCreds)).toBe(withCreds);
  });

  it("leaves other controllers and missing controllers alone", () => {
    const evosc = { type: "evosc" };
    expect(controllerForProvisioning(evosc)).toBe(evosc);
    expect(controllerForProvisioning(undefined)).toBeUndefined();
  });
});

describe("controller env in provisioning scripts", () => {
  it("writes DB_TYPE and controller settings when adding a server", () => {
    const script = template("add-server.sh.hbs")({
      ...base,
      server_controller: { type: "pyplanet", admins: ["a", "b"] },
      db,
    });
    expect(script).toContain("CONTROLLER_TYPE='pyplanet'");
    expect(script).toContain("DB_TYPE=mysql\nEOF");
    expect(script).toContain("PY_ADMINS=a,b");
    expect(script).toContain("docker-configs/docker-compose.$DB_TYPE.yml");
  });

  it("adds no controller env without a controller", () => {
    const script = template("add-server.sh.hbs")(base);
    expect(script).toContain("CONTROLLER_TYPE=''");
    expect(script).not.toContain("DB_HOST=");
  });

  it("uses the same block for new servers", () => {
    const script = template("server-init.sh.hbs")({
      ...base,
      stack_name: "stack-0",
      server_controller: { type: "evosc" },
      db,
    });
    expect(script).toContain("DB_TYPE=mysql\nEOF");
    expect(script).not.toContain("{{");
  });
});
