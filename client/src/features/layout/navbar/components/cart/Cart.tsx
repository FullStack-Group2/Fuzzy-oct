// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import { useState } from 'react';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { FaArrowLeftLong } from 'react-icons/fa6';
import CartItem from './CartItem';
import { useShopCart } from '../../stores/ShopCartDataContext';

interface DataItem {
  name: string;
  imgSrc: string;
  price: number;
  quantity: number;
}

function calculateTotal(products: any[]): number {
  if (!Array.isArray(products)) return 0;

  return products.reduce((sum, item) => {
    if (item && item.product) {
      return sum + (item.product.price || 0) * (item.quantity || 0);
    }
    return sum; // skip items without product
  }, 0);
}

export default function Cart() {
  const { cart, loading, error, createOrder } = useShopCart();

  const [isOpen, setIsOpen] = useState(false);

  function orderItems() {
    setIsOpen(false);
    createOrder();
  }

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <button
        className="relative"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <HiOutlineShoppingCart className="size-8" />

        {/*quantity in cart*/}
        <div className="absolute right-0 bottom-0 rounded-full w-[16px] h-[16px] bg-black text-white flex justify-center items-center text-[8px]">
          {cart.length >= 100 ? '99+' : cart.length}
        </div>
      </button>

      {/*cover background in black*/}
      {isOpen && (
        <div className="bg-black/50 fixed top-0 left-[-16px] w-screen h-screen z-50" />
      )}

      {/*cart side bar*/}
      <section
        className={`bg-white w-full sm:w-[393px] h-screen p-5 fixed top-0 right-0 z-50 transform transition-transform duration-300  ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className=" border-b-[0.5px] border-[#B1B1B1]">
          <button onClick={() => setIsOpen(false)} className="text-black mb-5">
            <FaArrowLeftLong className="inline-block" /> Back
          </button>
        </header>

        <main className="h-[calc(100%-140px)] py-10 overflow-y-auto flex flex-col gap-5">
          {cart.map((item, index) => (
            <CartItem key={index} dataItem={item} />
          ))}
        </main>

        <footer className="absolute right-0 bottom-0 w-full h-[140px] bg-[#F9F9F9] p-6 flex flex-col justify-between">
          <div className="w-full flex justify-between">
            <p>Total</p>
            <p>{Intl.NumberFormat('vi-VN').format(calculateTotal(cart))} vnd</p>
          </div>
          <button
            onClick={() => orderItems()}
            className="w-full text-center bg-[#1E7A5A] text-white p-2 rounded-lg"
          >
            Order
          </button>
        </footer>
      </section>
    </>
  );
}
