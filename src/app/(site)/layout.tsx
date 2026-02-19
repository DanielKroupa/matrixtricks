import { Navbar } from "../components/pageLayout/Navbar";
import { Banner } from "../components/Banner";
import { PostSettings } from "../components/pageLayout/PostSettings";
import { GoalBar } from "../components/pageLayout/GoalBar";
import { Rubrics } from "../components/pageLayout/Rubrics";
import { Monetization } from "../components/Monetization";
import { Bio } from "../components/Bio";
import { Title } from "../components/Title";
import { Footer } from "../components/pageLayout/Footer";
import { OtherProjects } from "../components/pageLayout/OtherProjects";
import { FanWall } from "../components/pageLayout/FanWall";

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
