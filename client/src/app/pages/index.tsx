// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import ExploredCategories from '@/features/home/components/ExploredCateogires';
import FeaturedCategories from '@/features/home/components/FeaturedCategories';
import HeroSection from '@/features/home/components/HeroSection';

import ChatPage from "./ChatPage";


const Home = () => {
  {
    /*only customer can see this, if this is vendor or shipper --> vendor --> product, shipper --> order*/
  }
  return (
    <>
    <button onClick={() => {
      // Open chat page
      // navigate, have vendorid
    }}>Chat to vendor</button>
      <HeroSection />
      <section className="m-auto w-4/5">
        <FeaturedCategories />
        <ExploredCategories />
      </section>
  </>
  );
};

export default Home;
