import React from 'react';
import { PiShoppingCart } from 'react-icons/pi';

interface ShopCartItemProps {
  imgSrc: string;
  itemName: string;
  itemPrice: string;
}

const ShopCardItem: React.FC<ShopCartItemProps> = ({
  imgSrc,
  itemName,
  itemPrice,
}) => {
  return (
    <div className="group w-full hover:shadow-2xl rounded-md aspect-[17/25] p-3 flex flex-col justify-between sm:w-[45%] md:w-[26%]">
      <div className="relative h-[80%] w-full bg-[#EEF1F1] flex items-center justify-center">
        <img
          src={imgSrc}
          alt={`image about ${itemName}`}
          className="w-[75%] h-auto object-contain"
        />
        <button className="absolute left-0 bottom-0 w-full h-1/5 bg-black/50 hidden group-hover:flex items-center justify-center">
          <p className="text-white text-center">
            <PiShoppingCart className="inline-block size-5" /> Add to cart
          </p>
        </button>
      </div>
      <div className="text-center gap-2">
        <p className="text-[20px] font-medium">{itemName}</p>
        <p className="text-[14px] font-extralight text-[#B1B1B1]">
          {itemPrice} vnd
        </p>
      </div>
    </div>
  );
};

export default ShopCardItem;