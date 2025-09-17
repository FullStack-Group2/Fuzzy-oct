// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Le Nguyen Khuong Duy
// ID: s402664

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { useShopCart } from '@/features/layout/navbar/stores/ShopCartDataContext';
import { useProductDetail } from '@/features/shop/stores/ProductDetailDataContext';
import { AiOutlineShopping } from 'react-icons/ai';
import { Skeleton } from '@/components/ui/skeleton';
import NotFoundProduct from '@/features/shop/components/NotFoundProduct';

const ProductDetail = () => {
  const [quantity, setQuantity] = useState(1);
  const { cart, updateCartItem, addToCart } = useShopCart();
  const { product, vendor, loading, error } = useProductDetail();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (loading)
    return (
      <section className="m-auto p-6 w-[90%] flex flex-col gap-6 md:flex-row md:justify-between">
        {/* skeleton loading UI */}
        <Skeleton className="w-full md:w-[35%] md:min-h-[550px] aspect-[17/25]" />
        <section className="w-full md:w-[55%] flex flex-col">
          <header>
            <Skeleton className="w-[200px] h-8 mb-3" />
            <Skeleton className="w-[150px] h-6" />
          </header>
        </section>
      </section>
    );

  if (error) return <NotFoundProduct />;

  function currentCartQuantityOfProduct() {
    const productInCart = cart.find((item) => item.product._id === product._id);
    return productInCart ? productInCart.quantity : 0;
  }

  function increase() {
    if (quantity < product.availableStock) setQuantity(quantity + 1);
  }

  function decrease() {
    if (quantity > 1) setQuantity(quantity - 1);
  }

  function updateCart() {
    const currentProductQuantity = currentCartQuantityOfProduct();
    if (currentProductQuantity === 0) {
      addToCart(product._id, quantity);
    } else {
      updateCartItem(product._id, currentProductQuantity + quantity);
    }
  }

  return (
    <section className="m-auto p-6 w-[90%] flex flex-col gap-6 md:flex-row md:justify-between">
      {/* product image */}
      <div className="w-full md:w-[35%] md:min-h-[550px] aspect-[17/25] p-6 bg-[#EEF1F1] flex justify-center items-center">
        <img
          src={product?.imageUrl}
          alt={`image about ${product?.name}`}
          className="w-auto h-[75%] object-contain"
        />
      </div>

      {/* product info */}
      <section className="w-full md:w-[55%] flex flex-col">
        <header>
          <h1 className="font-medium text-3xl">{product?.name}</h1>
          {/* <p className="text-lg">
            {Intl.NumberFormat("vi-VN").format(product?.price)} vnd
          </p> */}
          {/* Sale */}
          {/* {product?.sale != 0 && < p className="text-gray-500 text-md"><s>{product?.price * (1 - (product?.sale/100))} vnd</s> <span className="text-sm ml-1.5">Tax included</span></p>} */}

          {product?.sale && product?.sale > 0 ? (
            // Có sale
            <div className="flex items-center space-x-2">
              <p className="text-gray-500 text-md line-through">
                {Intl.NumberFormat('vi-VN').format(product?.price)} đ
              </p>

              <p className="text-red-500 text-lg font-semibold">
                {Intl.NumberFormat('vi-VN').format(
                  product?.price * (1 - product?.sale / 100),
                )}{' '}
                đ
              </p>

              <span className="text-sm ml-1.5">Tax included</span>
            </div>
          ) : (
            // Không sale
            <p className="text-lg">
              {Intl.NumberFormat('vi-VN').format(product?.price)} đ
            </p>
          )}
          {/* Quantity + Add to cart */}
          <div className="flex gap-2 mt-6">
            <div className="w-[90px] h-[30px] border border-[#E6E7E9] flex justify-between items-center text-[20px] font-light rounded">
              <button className="w-1/3 hover:bg-[#E6E7E9]" onClick={decrease}>
                -
              </button>
              <span>{quantity}</span>
              <button className="w-1/3 hover:bg-[#E6E7E9]" onClick={increase}>
                +
              </button>
            </div>

            <button
              className="bg-[#1E7A5A] px-5 h-[30px] rounded text-white flex items-center gap-1"
              onClick={updateCart}
              disabled={quantity === 0}
            >
              <AiOutlineShopping className="size-5" /> Add to cart
            </button>
          </div>

          <p className="font-extralight text-sm text-[#B1B1B1] my-4">
            Available stock: {product?.availableStock}
          </p>
        </header>

        <div className="w-full border-t border-b border-[#B1B1B1] py-3">
          <div>
            <h2 className="inline-block font-semibold mr-2">Categories:</h2>
            <p className="inline-block text-[#B1B1B1] font-extralight">
              {product?.category}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold">Description</h2>
            <p>{product?.description}</p>
          </div>
        </div>

        <footer className="min-h-[90px] flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-[70px] aspect-1 border border-black rounded-full overflow-hidden ${
                vendor?.profilePicture === '' ? 'bg-[#eef1f1]' : ''
              }`}
            >
              {vendor?.profilePicture && (
                <img
                  className="w-full h-full object-contain"
                  src={vendor.profilePicture}
                  alt={`vendor ${vendor?.businessName}`}
                />
              )}
            </div>
            <p className="text-lg font-extralight">{vendor?.businessName}</p>
          </div>

          <Link
            to={`/shop/${vendor?._id}`}
            className="text-[#1E7A5A] border border-[#1E7A5A] hover:bg-[#1E7A5A] hover:text-white p-2 rounded"
          >
            Check shop
          </Link>
        </footer>
      </section>
    </section>
  );
};

export default ProductDetail;
