import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PropertyList } from "./PropertyList";
import { PropertyFormWizard } from "./PropertyFormWizard";
import { PropertyAnalytics } from "./PropertyAnalytics";
import { PlusIcon, HomeIcon, ChartBarIcon } from "lucide-react";

export function OwnersPage() {
  const [activeTab, setActiveTab] = useState("properties");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Property Management</h1>
        <p className="text-muted-foreground">
          Manage your properties, add new listings, and track performance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <HomeIcon className="h-4 w-4" />
            <span>My Properties</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            <span>Add New</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <PropertyList />
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <PropertyFormWizard
            mode="create"
            onSuccess={() => {
              setActiveTab("properties");
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <PropertyAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}