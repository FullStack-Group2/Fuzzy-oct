import AboutBody from '@/features/about/components/AboutBody';
import AboutHeader from '@/features/about/components/AboutHeader';
import AboutMember from '@/features/about/components/AboutMember';

const About = () => {
  return (
    <section className="w-full">
      <AboutHeader />
      <AboutBody />
      <AboutMember/>
    </section>
  );
};

export default About;
