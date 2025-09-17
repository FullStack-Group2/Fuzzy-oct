// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Nhat Minh
// ID: s4019811

export default function AboutHeader() {
  return (
    <header className="relative w-full h-[400px]">
      <img
        src="/about/couch.png"
        alt="this image is a couch in about page"
        className="w-full h-full object-cover object-center"
      />
      <div className="absolute w-full h-full left-0 top-0 bg-white/15 flex justify-center items-center text-white text-lg sm:text-2xl md:text-4xl font-extralight">
        {' '}
        WHERE COMFORT MEETS PRESTIGE
      </div>
    </header>
  );
}
