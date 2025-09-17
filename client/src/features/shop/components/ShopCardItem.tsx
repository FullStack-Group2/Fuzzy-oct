// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import { useShopCart } from '@/features/layout/navbar/stores/ShopCartDataContext';
import React from 'react';
import { PiShoppingCart } from 'react-icons/pi';
import { Link } from 'react-router-dom';
interface ShopCartItemProps {
  id: string;
  imgSrc: string;
  itemName: string;
  itemPrice: number;
  itemSale: number;
}

const ShopCardItem: React.FC<ShopCartItemProps> = ({
  id,
  imgSrc,
  itemName,
  itemPrice,
  itemSale
}) => {
  const { addToCart } = useShopCart();
  return (
    <div className="group w-full hover:shadow-2xl rounded-md aspect-[17/25] p-3 flex flex-col justify-between">
      <Link
        to={`/products/${id}`}
        className="relative h-[80%] w-full p-3 bg-[#EEF1F1] flex items-center justify-center"
      >
        <img
          src={imgSrc}
          alt={`image about ${itemName}`}
          className="w-auto h-[75%] object-contain"
        />
        <button
          className="absolute left-0 bottom-0 w-full h-1/5 bg-black/50 hidden group-hover:flex items-center justify-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(id, 1);
          }}
        >
          <p className="text-white text-center">
            <PiShoppingCart className="inline-block size-5" /> Add to cart
          </p>
        </button>
      </Link>
      {/* <div className="text-center gap-2">
        <p className="text-[20px] font-medium">{itemName}</p>
        <p className="text-[14px] font-extralight text-[#B1B1B1]">
          {Intl.NumberFormat('vi-VN').format(itemPrice)} vnd
        </p>
      </div> */}
      <div className="text-center gap-2">
        <p className="text-[20px] font-medium">{itemName}</p>

        {itemSale && itemSale > 0 ? (
          // Có sale
          <div className="flex items-center justify-center space-x-2">
            <p className="text-gray-500 text-sm line-through">
              {Intl.NumberFormat('vi-VN').format(itemPrice)} đ
            </p>

            <p className="text-red-500 text-md font-semibold">
              {Intl.NumberFormat('vi-VN').format(
                itemPrice * (1 - itemSale / 100),
              )}{' '}
              đ
            </p>
          </div>
        ) : (
          // Không sale
          <p className="text-[14px] font-extralight text-[#B1B1B1]">
            {Intl.NumberFormat('vi-VN').format(itemPrice)} đ
          </p>
        )}
      </div>

    </div>
  );
};

export default ShopCardItem;
