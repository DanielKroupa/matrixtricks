import { Banner } from "./components/Banner";
import { Bio } from "./components/Bio";
import { GoalBar } from "./components/layout/GoalBar";
import { Navbar } from "./components/layout/Navbar";
import { Posts } from "./components/layout/Posts";
import { PostSettings } from "./components/layout/PostSettings";
import { Rubrics } from "./components/layout/Rubrics";
import { Monetization } from "./components/Monetization";
import { Title } from "./components/Title";

export default function Home() {
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
      <Posts />
    </>
  );
}
