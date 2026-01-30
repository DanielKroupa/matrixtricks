import { Navbar } from "../components/layout/Navbar";
import { Banner } from "../components/Banner";
import { PostSettings } from "../components/layout/PostSettings";
import { GoalBar } from "../components/layout/GoalBar";
import { Rubrics } from "../components/layout/Rubrics";
import { Monetization } from "../components/Monetization";
import { Bio } from "../components/Bio";
import { Title } from "../components/Title";
import { Footer } from "../components/layout/Footer";
import { OtherProjects } from "../components/layout/OtherProjects";
import { FanWall } from "../components/layout/FanWall";

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
      <div className="flex md:flex-row flex-col md:justify-between gap-2 px-2">
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
