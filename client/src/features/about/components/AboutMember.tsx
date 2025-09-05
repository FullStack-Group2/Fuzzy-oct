import AboutMemberCard from './AboutMemberCard';

export default function AboutMember() {
  return (
    <footer className="mx-auto w-[90%] mb-12">
      <h1 className="font-light text-4xl my-12">OUR MEMBER</h1>
      <div className="w-full flex flex-wrap justify-center gap-y-14 gap-x-32">
        <AboutMemberCard
          imgSrc="/about/tony.png"
          name="Pham Nhat Minh"
          description="He is ambitious and forward-thinking, always pushing boundaries with bold ideas."
        />

        <AboutMemberCard
          imgSrc="/about/tri.png"
          name="Truong Quoc Tri"
          description=" He is calm and thoughtful, bringing balance and clarity in every situation."
        />

        <AboutMemberCard
          imgSrc="/about/duy.png"
          name="Le Nguyen Khuong Duy"
          description="He is curious and inventive, never afraid to experiment and explore new perspectives."
        />

        <AboutMemberCard
          imgSrc="/about/rachel.png"
          name="Rachel Tran"
          description="She is creative and empathetic, with a natural gift for connecting with people."
        />

        <AboutMemberCard
          imgSrc="/about/huy.png"
          name="Pham Gia Huy"
          description="He is energetic and approachable, inspiring others with his optimism and drive."
        />
      </div>
    </footer>
  );
}
