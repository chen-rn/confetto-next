import MicButton from "@/components/MicButton";
import { notFound } from "next/navigation";

export default function SessionPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params;

  if (!sessionId) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Session: {sessionId}</h1>
      <div className="mt-8">
        <MicButton sessionId={sessionId} />
      </div>
    </div>
  );
}
