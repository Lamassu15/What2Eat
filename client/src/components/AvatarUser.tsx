import { AvatarImage } from "./ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import logo from "../assets/cat-eating.jpg";
import { Spinner } from "./ui/spinner";

const AvatarUser = () => {
  const { user } = useAuth();

  if (!user) return <Spinner className="size-5 text-shadow-destructive" />;

  return (
    <AvatarImage className="object-cover"
      src={user.imgProfile || logo}
      alt={user.firstName}
    />
  );
};

export default AvatarUser;
