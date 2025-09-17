import { FC } from 'react';

type AboutMemberCardProps = {
  imgSrc: string;
  name: string;
  description: string;
};

const AboutMemberCard: FC<AboutMemberCardProps> = ({
  imgSrc,
  name,
  description,
}) => {
  return (
    <div className="w-[260px] flex flex-col items-start gap-2">
      <div className="w-full aspect-1 bg-[#D2E4DD]">
        <img
          src={imgSrc}
          alt={`image of member ${name}`}
          className="w-full aspect-1"
        />
      </div>
      <p className="text-base font-medium">{name}</p>
      <p className="text-sm font-extralight">{description}</p>
    </div>
  );
};
export default AboutMemberCard;
