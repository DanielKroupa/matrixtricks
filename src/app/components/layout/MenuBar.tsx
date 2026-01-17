import { GoalBar } from "./GoalBar";
import { PostSettings } from "./PostSettings";

export function MenuBar() {
  return (
    <div className="flex md:flex-row flex-col md:justify-between gap-2 px-2">
      <div className="flex md:flex-row flex-col-reverse md:justify-between gap-2 px-2">
        <GoalBar />
      </div>
      <div className="flex gap-2 w-full md:w-auto justify-between md:justify-baseline">
        <PostSettings />
      </div>
    </div>
  );
}
