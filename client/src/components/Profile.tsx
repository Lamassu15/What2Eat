import ProfileContent from "./ProfileContent";
import ProfileHeader from "./ProfileHeader";

const Profile = () => {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 py-10">
      <ProfileHeader />
      <ProfileContent />
    </section>
  );
};

export default Profile;
