"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getPrompts, updatePrompt } from "@/lib/actions/promptActions";

export default function PromptManager() {
  const [prompts, setPrompts] = useState<{ id: string; name: string; prompt: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editedPrompts, setEditedPrompts] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setIsLoading(true);
    try {
      const fetchedPrompts = await getPrompts();
      setPrompts(fetchedPrompts);
      setEditedPrompts(fetchedPrompts.reduce((acc, p) => ({ ...acc, [p.id]: p.prompt }), {}));
    } catch (error) {
      console.error("Failed to load prompts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updatePrompt(id, editedPrompts[id]);
      setPrompts(prompts.map((p) => (p.id === id ? { ...p, prompt: editedPrompts[id] } : p)));
    } catch (error) {
      console.error("Failed to update prompt:", error);
    }
  };

  const handleChange = (id: string, newPrompt: string) => {
    setEditedPrompts({ ...editedPrompts, [id]: newPrompt });
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading prompts...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prompt Manager</h1>
      {prompts.map((prompt) => (
        <div key={prompt.id} className="mb-4">
          <h2 className="text-xl font-semibold">{prompt.name}</h2>
          <Textarea
            className="w-full mt-2"
            rows={10}
            value={editedPrompts[prompt.id]}
            onChange={(e) => handleChange(prompt.id, e.target.value)}
          />
          <Button className="mt-2" onClick={() => handleUpdate(prompt.id)}>
            Save
          </Button>
        </div>
      ))}
    </div>
  );
}
