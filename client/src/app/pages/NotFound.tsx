// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Le Nguyen Khuong Duy
// ID: s4026694

const NotFound = () => {
  return (
    <section className="w-full h-auto flex flex-col justify-start items-center mb-28 p-10">
      <div className="relative text-[150px] sm:text-[200px] md:text-[400px] font-bold text-[#e2e0e0]">
        404
      </div>
      <img
        src="/chair-notfound.png"
        alt="chair in not found"
        className="absolute w-[150px] sm:w-[200px] md:w-[400px]"
      />
      <h1 className="text-[20px] sm:text-[30px] md:text-[65px] font-semibold -mt-15 md:-mt-24">
        PAGE NOT FOUND
      </h1>
      <p className="text-sm md:text-base text-center">
        {' '}
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>
    </section>
  );
};

export default NotFound;
