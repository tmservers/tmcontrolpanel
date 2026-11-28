import FormElement from "@/components/form/form-element";

export default function CredentialFields({
  prefix = "",
}: {
  // Where the fields live in the surrounding form
  prefix?: "" | "server.";
}) {
  return (
    <div className="grid items-start gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <FormElement
          name={`${prefix}dediLogin`}
          label="Server login"
          placeholder="Enter server login"
          rootClassName="max-w-full"
          isRequired
        />
        <p className="text-xs text-muted-foreground">
          Create one on the{" "}
          <a
            href="https://www.trackmania.com/player/dedicated-servers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            Trackmania dedicated servers page
          </a>
          .
        </p>
      </div>

      <FormElement
        name={`${prefix}dediPassword`}
        label="Server password"
        placeholder="Enter server password"
        type="password"
        rootClassName="max-w-full"
        isRequired
      />

      <FormElement
        name={`${prefix}roomPassword`}
        label="Room password"
        placeholder="Leave empty for a public server"
        rootClassName="max-w-full sm:col-span-2"
      />
    </div>
  );
}
