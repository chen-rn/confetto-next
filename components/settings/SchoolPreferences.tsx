"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  addSchool,
  removeSchool,
  getAllSchools,
  getUserSchools,
} from "@/lib/actions/schoolActions";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface School {
  id: string;
  name: string;
  state: string;
  country: string;
}

export function SchoolPreferences() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: userSchools = [] } = useQuery<School[]>({
    queryKey: ["userSchools"],
    queryFn: () => {
      return getUserSchools();
    },
  });

  const { data: availableSchools = [] } = useQuery<School[]>({
    queryKey: ["availableSchools"],
    queryFn: () => {
      return getAllSchools();
    },
  });

  // Mutations
  const addSchoolMutation = useMutation({
    mutationFn: addSchool,
    onMutate: async (schoolId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["userSchools"] });

      // Snapshot the previous value
      const previousUserSchools = queryClient.getQueryData<School[]>(["userSchools"]);

      // Add the new school optimistically
      const newSchool = availableSchools.find((school) => school.id === schoolId);
      if (newSchool) {
        queryClient.setQueryData<School[]>(["userSchools"], (old = []) => [...old, newSchool]);
      }

      return { previousUserSchools };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUserSchools) {
        queryClient.setQueryData(["userSchools"], context.previousUserSchools);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add school",
      });
      console.error(err);
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["userSchools"] });
    },
  });

  const removeSchoolMutation = useMutation({
    mutationFn: removeSchool,
    onMutate: async (schoolId) => {
      await queryClient.cancelQueries({ queryKey: ["userSchools"] });

      const previousUserSchools = queryClient.getQueryData<School[]>(["userSchools"]);

      // Remove the school optimistically
      queryClient.setQueryData<School[]>(["userSchools"], (old = []) =>
        old.filter((school) => school.id !== schoolId)
      );

      return { previousUserSchools };
    },
    onError: (err, variables, context) => {
      if (context?.previousUserSchools) {
        queryClient.setQueryData(["userSchools"], context.previousUserSchools);
      }
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

  // Handlers
  const handleAddSchool = (schoolId: string) => {
    addSchoolMutation.mutate(schoolId);
    setOpen(false);
  };

  const handleRemoveSchool = (schoolId: string) => {
    removeSchoolMutation.mutate(schoolId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              Select schools...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command className="w-full">
              <CommandInput placeholder="Search schools..." />
              <CommandList>
                <CommandEmpty>No school found.</CommandEmpty>
                <CommandGroup>
                  {availableSchools.map((school: School) => (
                    <CommandItem key={school.id} onSelect={() => handleAddSchool(school.id)}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          userSchools.some((s) => s.id === school.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {school.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex flex-wrap gap-2">
          {userSchools.length > 0 ? (
            userSchools.map((school: School) => (
              <Badge key={school.id} variant="secondary" className="flex items-center gap-1">
                {school.name}
                <button
                  onClick={() => handleRemoveSchool(school.id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No schools selected</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
