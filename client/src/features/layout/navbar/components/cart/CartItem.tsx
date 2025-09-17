// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import React from 'react';
import { CiTrash } from 'react-icons/ci';
import { useShopCart } from '../../stores/ShopCartDataContext';

interface DataItem {
  name: string;
  imgSrc: string;
  price: number;
  quantity: number;
}
interface CartItemProps {
  dataItem: DataItem;
  cartData: Array<DataItem>;
  setData: any;
}

const CartItem: React.FC<any> = ({ dataItem }) => {
  const { updateCartItem, removeCartItem } = useShopCart();
  // if(!dataItem) return <></>

  const { _id, product, quantity } = dataItem;

  function increase() {
    console.log(`click on dataItem: ${JSON.stringify(dataItem)}`);
    updateCartItem(product._id, quantity + 1);
  }

  function decrease() {
    updateCartItem(product._id, quantity - 1);
  }

  function removeItem() {
    removeCartItem(_id);
  }

  return (
    <div className="w-full flex justify-between items-start">
      <div className="flex gap-4">
        {/*product image*/}
        <div className="w-[120px] aspect-[17/25] bg-[#EEF1F1] flex justify-center items-center">
          <img
            src={product?.imageUrl}
            alt={product?.name}
            className="w-[75%] h-auto object-contain"
          />
        </div>

        {/*product info*/}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-[16px] font-medium">{product?.name}</p>
            <p className="text-[12px] font-extralight text-[#B1B1B1]">
              {/* {Intl.NumberFormat('vi-VN').format(product?.price)} Vnd */}
              <p className="text-lg">
                {Intl.NumberFormat('vi-VN').format(
                  product?.sale && product?.sale > 0
                    ? product?.price * (1 - product?.sale / 100) // giá sau giảm
                    : product?.price // giá gốc
                )}{' '}
                Vnd
              </p>

            </p>
          </div>

          <div className="w-[90px] h-[30px] border-[1px] border-[#E6E7E9] flex justify-between text-[20px] font-light">
            <button
              className="hover:bg-[#E6E7E9] w-1/3"
              onClick={() => {
                decrease();
              }}
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              className="hover:bg-[#E6E7E9] w-1/3"
              onClick={() => {
                increase();
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          removeItem();
        }}
      >
        <CiTrash className="size-8" />
      </button>
    </div>
  );
};
export default CartItem;
