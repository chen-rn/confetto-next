"use client";

import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import Fuse from "fuse.js";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { School } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { getAllSchools } from "@/lib/actions/schoolActions";

interface SchoolSelectorProps {
  selectedSchools: School[];
  onSchoolToggle: (school: School) => void;
  onSchoolRemove: (schoolId: string) => void;
  buttonText?: string;
  showSkip?: boolean;
  onSkip?: () => void;
  className?: string;
}

export function SchoolSelector({
  selectedSchools,
  onSchoolToggle,
  onSchoolRemove,
  buttonText = "Select schools...",
  className,
}: SchoolSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: availableSchools = [], isLoading } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      try {
        return await getAllSchools();
      } catch (error) {
        console.error("Failed to fetch schools:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const fuse = useMemo(
    () =>
      new Fuse(availableSchools, {
        keys: [
          { name: "name", weight: 2 },
          { name: "state", weight: 1 },
          { name: "country", weight: 1 },
        ],
        threshold: 0.4,
        shouldSort: true,
        minMatchCharLength: 1,
        ignoreLocation: true,
        findAllMatches: true,
      }),
    [availableSchools]
  );

  const filteredSchools = useMemo(() => {
    if (!search.trim()) return availableSchools.slice(0, 50);
    if (search !== debouncedSearch) return [];

    return fuse.search(debouncedSearch).map((result) => result.item);
  }, [availableSchools, search, debouncedSearch, fuse]);

  const formatLocation = (state: string, country: string) =>
    country === "United States of America" ? `${state}, US` : `${state}, ${country}`;

  return (
    <div className={cn("space-y-4", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white"
          >
            {selectedSchools.length > 0
              ? `${selectedSchools.length} school${
                  selectedSchools.length === 1 ? "" : "s"
                } selected`
              : buttonText}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search schools..."
              value={search}
              onValueChange={setSearch}
              className="border-none focus:ring-0"
            />
            <CommandList>
              <CommandEmpty>
                {isLoading
                  ? "Loading..."
                  : search !== debouncedSearch
                  ? "Searching..."
                  : filteredSchools.length === 0
                  ? "No schools found."
                  : null}
              </CommandEmpty>
              {filteredSchools.length > 0 && (
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {filteredSchools.map((school) => (
                    <CommandItem
                      key={school.id}
                      value={school.name}
                      onSelect={() => {
                        onSchoolToggle(school);
                        setOpen(false);
                      }}
                      className="flex items-center py-2"
                    >
                      <div className="flex items-center w-full min-w-0">
                        <Check
                          className={cn(
                            "h-4 w-4 flex-shrink-0 mr-2",
                            selectedSchools.some((s) => s.id === school.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex items-center justify-between w-full min-w-0">
                          <span className="truncate font-medium mr-4 flex-1 min-w-0">
                            {school.name}
                          </span>
                          <span className="text-sm text-muted-foreground flex-shrink-0">
                            {formatLocation(school.state, school.country)}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        {selectedSchools.map((school) => (
          <Badge key={school.id} variant="secondary" className="text-sm">
            {school.name}
            <button
              className="ml-1 rounded-full hover:bg-destructive/20"
              onClick={() => onSchoolRemove(school.id)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
