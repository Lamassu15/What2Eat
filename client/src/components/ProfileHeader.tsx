import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AvatarUser from "./AvatarUser";

const ProfileHeader = () => {

  const { user } = useAuth();
  if (!user) return <p>Loading user info...</p>;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarUser />
              <AvatarFallback className="text-2xl">USER</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <Badge variant="destructive" className="uppercase tracking-wide">
                <strong>{user.roles}</strong>
              </Badge>
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {user.email}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
