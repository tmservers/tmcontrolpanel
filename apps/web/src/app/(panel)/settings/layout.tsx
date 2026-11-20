export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-4 lg:p-6 h-full">{children}</div>;
}
