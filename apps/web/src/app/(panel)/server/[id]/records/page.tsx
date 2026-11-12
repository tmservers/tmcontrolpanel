import { PaginationTable } from "@/components/table/pagination-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createRecordsActions } from "./actions";
import { createMapsColumns } from "./maps-columns";
import { createMatchesColumns } from "./matches-columns";

export default async function ServerRecordsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="maps">Maps</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="flex flex-col gap-2">
          <PaginationTable
            createColumns={createMatchesColumns}
            args={id}
            endpoint={`/api/servers/${id}/matches`}
            filter
            actions={createRecordsActions}
            actionsArgs={id}
          />
        </TabsContent>

        <TabsContent value="maps" className="flex flex-col gap-2">
          <PaginationTable
            createColumns={createMapsColumns}
            endpoint={`/api/servers/${id}/records/maps`}
            filter
            actions={createRecordsActions}
            actionsArgs={id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
