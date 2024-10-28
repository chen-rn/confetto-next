import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

async function getUpcomingInterviews() {
  // This is a placeholder. You'll need to implement a scheduling system
  // to fetch actual upcoming interviews.
  return [
    { type: "MMI Practice", date: "Tomorrow", time: "2:00 PM" },
    { type: "Ethics Scenario", date: "Oct 15", time: "10:00 AM" },
    { type: "Panel Interview", date: "Oct 18", time: "3:30 PM" },
  ];
}

export async function UpcomingInterviews() {
  const upcomingInterviews = await getUpcomingInterviews();

  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Interviews</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {upcomingInterviews.map((interview, index) => (
            <li key={index} className="flex items-center">
              <div className="w-2 h-2 bg-[#635BFF] rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">{interview.type}</p>
                <p className="text-sm text-gray-500">
                  {interview.date}, {interview.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <Button variant="link" className="mt-4 text-[#635BFF] p-0">
          View all scheduled interviews
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
