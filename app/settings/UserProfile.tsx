import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function UserProfile() {
  const user = await currentUser();

  if (!user) return null;

  return (
    <Card className="border shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/10">
            <AvatarImage src={user.imageUrl} alt={user.firstName ?? ""} />
            <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <p className="text-base font-medium leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{user.emailAddresses[0].emailAddress}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
