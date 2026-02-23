import { Banner } from "@/components/main/Banner";
import { Bio } from "@/components/main/Bio";
import { Monetization } from "@/components/main/Monetization";
import { FanWall } from "@/components/main/FanWall";
import { Footer } from "@/components/main/Footer";
import { GoalBar } from "@/components/main/GoalBar";
import { Navbar } from "@/components/main/Navbar";
import { OtherProjects } from "@/components/main/OtherProjects";
import { PostSettings } from "@/components/main/PostSettings";
import { Rubrics } from "@/components/main/Rubrics";
import { Title } from "@/components/main/Title";

export default function SiteLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Banner />
      <Title />
      <Bio />

      <Monetization />
      <div className="flex flex-col gap-2 px-2 md:flex-row md:justify-between">
        <Rubrics />
        <GoalBar />
        <PostSettings />
      </div>

      {children}
      {modal}
      <FanWall />
      <OtherProjects />
      <Footer />
    </>
  );
}
