import { legacyManialinkTheme, resolvePreset } from "@tmcontrolpanel/shared";

const px = (units: number) => `${units * 5}px`;

export default function ManialinkThemePreview({ preset }: { preset: string }) {
  const theme = legacyManialinkTheme(resolvePreset(preset));
  const tokens = resolvePreset(preset).tokens;
  const rows = ["Marijntje04", "Speedy", "Wirtual"];

  return (
    <div
      aria-label={`${preset} theme preview`}
      role="img"
      className="flex items-center justify-center overflow-hidden rounded-md bg-[linear-gradient(135deg,#4b6b8a,#1d2b3a)] p-6"
    >
      <div
        className="overflow-hidden rounded-sm shadow-lg"
        style={{ width: px(55) }}
      >
        <div
          className="px-3 py-2 text-xs font-semibold"
          style={{
            background: `#${theme.quad.background}`,
            color: `#${theme.label.foreground}`,
            fontFamily: tokens.font.title,
          }}
        >
          Live Ranking
        </div>
        {rows.map((name, i) => (
          <div
            key={name}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            style={{
              background: `#${i % 2 ? theme.quad.backgroundMuted : theme.quad.foreground}`,
              color: `#${theme.label.background}`,
              fontFamily: tokens.font.body,
            }}
          >
            <span
              className="font-semibold"
              style={{ color: `#${tokens.color.accent}` }}
            >
              {i + 1}
            </span>
            <span className="flex-1 truncate">{name}</span>
            <span>{12 - i * 3} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
