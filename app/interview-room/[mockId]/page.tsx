import { getLivekitRoomToken } from "@/lib/actions/getLivekitRoomToken";
import { prisma } from "@/lib/apis/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { InterviewRoom } from "../../../components/InterviewRoom";

interface PageProps {
  params: {
    mockId: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { mockId } = params;
  const userId = auth().userId;

  if (!userId) {
    redirect(ROUTES.SIGN_IN);
  }

  const mock = await prisma.mockInterview.findUnique({
    where: { id: mockId },
    include: { question: true },
  });

  if (!mock) {
    redirect(ROUTES.HOME);
  }

  const { accessToken } = await getLivekitRoomToken(mock.question.content);

  return <InterviewRoom token={accessToken} question={mock.question.content} />;
}
