// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Nhat Minh
// ID: s4019811

import AboutBody from '@/features/about/components/AboutBody';
import AboutHeader from '@/features/about/components/AboutHeader';
import AboutMember from '@/features/about/components/AboutMember';

const About = () => {
  return (
    <section className="w-full">
      <AboutHeader />
      <AboutBody />
      <AboutMember />
    </section>
  );
};

export default About;
