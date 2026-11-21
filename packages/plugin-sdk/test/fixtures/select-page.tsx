/** @jsxRuntime automatic */
/** @jsxImportSource maniatsx */
import { Manialink, render } from "maniatsx";
import { Select } from "../../src/ui/select";

// Compiled by the select test with the maniatsx esbuild plugin, like a plugin build
const options = Array.from({ length: 12 }, (_, i) => ({
  value: `file-${i}`,
  label: `Script ${i}`,
  detail: `detail-${i}`,
}));

export const listPage = render(
  <Manialink id="select-test">
    <Select
      name="script-name"
      value="file-3"
      options={options}
      width={40}
      custom={{ label: "Custom script…" }}
    />
  </Manialink>,
);

export const customPage = render(
  <Manialink id="select-test">
    <Select
      name="script-name"
      value="My/Own.Script.txt"
      options={options.slice(0, 3)}
      width={40}
      custom={{ label: "Custom" }}
    />
  </Manialink>,
);
