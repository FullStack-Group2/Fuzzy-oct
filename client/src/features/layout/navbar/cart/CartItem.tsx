import React from 'react';
import { CiTrash } from 'react-icons/ci';

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

const CartItem: React.FC<CartItemProps> = ({ dataItem, cartData, setData }) => {
  const { name, imgSrc, price, quantity } = dataItem;

  function increase() {
    setData((prev: DataItem[]) =>
      prev.map((item) =>
        item.name === dataItem.name
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  function decrease() {
    setData((prev: DataItem[]) =>
      prev.map((item) =>
        item.name === dataItem.name && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  }

  function removeItem() {
    setData((prev: typeof cartData) => {
      // filter out the current item
      const updatedProducts = prev.filter(
        (item) => item.name !== dataItem.name,
      );

      return updatedProducts;
    });
  }

  return (
    <div className="w-full flex justify-between items-start">
      <div className="flex gap-4">
        {/*product image*/}
        <div className="w-[120px] aspect-[17/25] bg-[#EEF1F1] flex justify-center items-center">
          <img
            src={imgSrc}
            alt={name}
            className="w-[75%] h-auto object-contain"
          />
        </div>

        {/*product info*/}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-[16px] font-medium">{name}</p>
            <p className="text-[12px] font-extralight text-[#B1B1B1]">
              {Intl.NumberFormat('vi-VN').format(price)} Vnd
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
