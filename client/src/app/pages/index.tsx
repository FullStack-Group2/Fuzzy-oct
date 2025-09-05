import ExploredCategories from '@/features/home/components/ExploredCateogires';
import FeaturedCategories from '@/features/home/components/FeaturedCategories';
import HeroSection from '@/features/home/components/HeroSection';

const Home = () => {
  {/*only customer can see this, if this is vendor or shipper --> vendor --> product, shipper --> order*/}
  return (
    <>
      <HeroSection />
      <section className="m-auto w-4/5">
        <FeaturedCategories />
        <ExploredCategories/>
        
      </section>
    </>
  );
};

export default Home;
