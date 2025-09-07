import { Link } from 'react-router-dom';

export default function ExploredCategories() {
  return (
    <div className="w-full min-h-max flex flex-col gap-5 md:flex-row mb-24">
      <div className=" w-full md:w-1/2 h-[600px] bg-[rgb(247,241,236)] flex flex-col gap-4 items-center justify-center">
        <img src="/home/chairCategory.png" className="w-[58%] md:w-[80%] lg:w-[58%]" />

        <div className="flex flex-col gap-4 items-center">
          <h1 className="text-4xl md:text-3xl lg:text-4xl">
            <span className="font-light">White</span>{' '}
            <span className="font-medium ">chair</span>
          </h1>
          <Link
            to="/shop?category=CHAIRS"
            className="px-4 text-base md:text-sm md:px-4 lg:text-base py-3 rounded-sm bg-[#152b19] text-white text-center"
          >
            Explore category
          </Link>
        </div>
      </div>

      <div className="w-full md:w-1/2 aspect-1 flex flex-col gap-5">
        <div className="p-3 w-full h-[290px] bg-[#e5eff3] flex items-center justify-around">
          <div className="flex flex-col gap-4 items-start">
            <h1 className="text-4xl md:text-3xl lg:text-4xl">
              <span className="font-light block">Wooden</span>{' '}
              <span className="font-medium  block">shelve</span>
            </h1>
            <Link
              to="/shop?category=SHELVES"
              className="px-4  text-base md:px-1 md:text-sm lg:px-4 lg:text-base py-3 rounded-sm bg-[#152b19] text-white text-center"
            >
              Explore category
            </Link>
          </div>
          <img
            src="/home/shelveCategory.png"
            className="h-[60%] lg:h-[80%]"
          />
        </div>

        <div className="p-3 w-full h-[290px] bg-[#eef4f2] flex items-center justify-around">
          <img
            src="/home/dinningTableCategory.png"
            className="h-[45%] lg:h-[60%]"
          />
          <div className="flex flex-col gap-4 items-start">
            <h1 className="text-4xl md:text-3xl lg:text-4xl">
              <span className="font-light block">Dinning</span>{' '}
              <span className="font-medium  block">table</span>
            </h1>
            <Link
              to="/shop?category=TABLES"
              className="px-4 text-base  md:px-1 md:text-sm lg:px-4 lg:text-base py-3 rounded-sm bg-[#152b19] text-white text-center"
            >
              Explore category
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
