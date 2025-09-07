export default function HeroSection() {
  return (
    <section className="w-full h-[calc(100vh-40px)] bg-[#DDEBE6] flex justify-center items-center">
      <div className="w-[70%] lg:w-[85%] flex flex-col items-center lg:flex-row-reverse lg:justify-between lg:items-start">
        <img
          className="w-full lg:w-[60%] object-contain mb-28"
          src="/home/heroImage.png"
          alt="hero section image"
        />
        <div className="w-full lg:w-[35%] flex flex-col gap-7 lg:gap-4 items-start lg:mt-12">
          <h1 className="text-xl lg:text-3xl font-semibold w-full leading-relaxed">
            STEP INTO THE WORLD OF PREMIUM FURNITURE TRENDS
          </h1>
          <p className="w-full font-light text-base">
            Discover a curated collection where timeless craftsmanship meets
            contemporary elegance. Redefine your home with furniture that
            reflects both style and prestige
          </p>
          <button className="w-full md:w-auto md:px-7 py-3 border-[1px] border-black font-light hover:bg-black hover:text-white">
            Shop now
          </button>
        </div>
      </div>
    </section>
  );
}
