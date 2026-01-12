import Image from "next/image";

export function GoalBar() {
  return (
    <div className="bg-linear-to-r from-yellow-300 to-orange-400 rounded-full px-4 flex justify-between items-center py-1 xl:w-155.25 text-red-900 font-semibold">
      <div>
        <p className="font-bold">0 CZK</p>
      </div>
      <div className="absolute left-1/2">
        <Image
          src="/images/goalbar-ball.png"
          alt="basketball icon"
          width={128}
          className="relative object-contain select-none"
          draggable="false"
          height={128}
        />
      </div>
      <div className="font-bold">500 CZK</div>
    </div>
  );
}
