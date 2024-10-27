"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SchoolSelector } from "@/components/SchoolSelector";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addSchool, removeSchool, getUserSchools } from "@/lib/actions/schoolActions";
import type { School } from "@prisma/client";

export function SchoolPreferences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userSchools = [] } = useQuery({
    queryKey: ["userSchools"],
    queryFn: async () => {
      try {
        return await getUserSchools();
      } catch (error) {
        console.error("Failed to fetch user schools:", error);
        return [];
      }
    },
  });

  // Properly typed mutations
  const addSchoolMutation = useMutation({
    mutationFn: (schoolId: string) => addSchool(schoolId),
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add school",
      });
      console.error(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userSchools"] });
    },
  });

  const removeSchoolMutation = useMutation({
    mutationFn: (schoolId: string) => removeSchool(schoolId),
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove school",
      });
      console.error(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userSchools"] });
    },
  });

  const handleSchoolToggle = (school: School) => {
    const exists = userSchools.some((s) => s.id === school.id);
    if (exists) {
      removeSchoolMutation.mutate(school.id);
    } else {
      addSchoolMutation.mutate(school.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <SchoolSelector
          selectedSchools={userSchools}
          onSchoolToggle={handleSchoolToggle}
          onSchoolRemove={(id) => removeSchoolMutation.mutate(id)}
        />
      </CardContent>
    </Card>
  );
}
