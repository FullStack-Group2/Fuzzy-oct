// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:  Pham Nhat Minh, Truong Quoc Tri
// ID: , 4010989


import React from "react";

type HeroBannerProps = {
  image: string;
  title: string;
  subtitle: string;
};

export default function HeroBanner({ image, title, subtitle }: HeroBannerProps) {
  return (
    <div className="relative w-full h-[220px] sm:h-[250px] md:h-[300px] overflow-hidden bottom-6">
      <img
        src={image}
        alt={title}
        className="absolute w-full h-full object-cover object-[center_60%] z-0"
      />
      {/* Dark overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>

      {/* Text */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          {title}
        </h1>
        <p className="text-white mt-1 sm:mt-2 text-sm sm:text-base">{subtitle}</p>
      </div>
    </div>
  );
}
