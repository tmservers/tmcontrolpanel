import ConnectedApps from "@/components/settings/connected-apps";

// Settings of the signed-in user, not of a server
export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <ConnectedApps />
    </div>
  );
}
