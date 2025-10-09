import Profile from "@/components/Profile";
import { SectionTitle } from "@/components/ui/SectionTitle";

const Account = () => {
  return (
    <>
      <section className="w-full flex flex-col">
        <SectionTitle
          title="Your Account"
          subtitle="Manage your account settings and preferences."
        ></SectionTitle>
        <Profile />
      </section>
    </>
  );
};

export default Account;
