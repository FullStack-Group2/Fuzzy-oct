export default function ExploredCategories() {
  return (
    <div className="w-full flex flex-col gap-5 md:flex-row pb-24">
      <div className="w-full md:w-1/2 md:h-full aspect-1 bg-[#f7f1ec] flex flex-col">
      <img src="/home/dinningTableCategory.png" className="w-[80%]"/>
      </div>

      <div className="w-full md:w-1/2 md:h-full aspect-1 flex flex-col gap-5">
        <div className="w-full h-1/2 bg-[#e5eff3]"></div>
        <div className="w-full h-1/2 bg-[#eeeeee]"></div>
      </div>
    </div>
  );
}
