import { AvatarImage } from "./ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import logo from "../assets/cat-eating.jpg";
import { Loader } from "lucide-react";

const AvatarUser = () => {
  const { user } = useAuth();
  if (!user) return <Loader className="animate-spin" />;
  return (
    <AvatarImage
      src={user.imgProfile || logo}
      alt={user.firstName}
    />
  );
};

export default AvatarUser;
