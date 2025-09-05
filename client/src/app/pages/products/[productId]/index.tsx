import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { useShopCart } from '@/features/layout/navbar/stores/ShopCartDataContext';
import { useProductDetail } from '@/features/shop/stores/ProductDetailDataContext';
import { AiOutlineShopping } from 'react-icons/ai';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetail = () => {
  const [quantity, setQuantity] = useState(1);
  const { cart, updateCartItem, addToCart } = useShopCart();
  const { product, vendor, loading, error } = useProductDetail();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading)
    return (
      <section className="m-auto p-6 w-[90%] flex flex-col gap-6 md:flex-row md:justify-between">
        {/*---------------------------- product image -------------------*/}
        <Skeleton className="w-full md:w-[35%] md:min-h-[550px] aspect-[17/25]" />

        {/*---------------------------- product info-------------------*/}

        <section className="w-full md:w-[55%] md:min-h-full flex flex-col">
          <header>
            <div>
              <Skeleton className="w-[200px] h-8 mb-3" />
              <Skeleton className="w-[150px] h-6" />
            </div>

            <div className="flex gap-2 mt-12">
              <Skeleton className="w-[100px] h-7" />
              <Skeleton className="w-[140px] h-7" />
            </div>
            <Skeleton className="w-[115px] h-4 my-4" />
          </header>
          <body className="w-full h-full border-[#B1B1B1] py-3">
            <Skeleton className="w-full h-[1px]" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="w-[95px] h-5 mr-2" />
              <Skeleton className="w-[120px] h-5" />
            </div>

            <div className="my-6">
              <Skeleton className="w-[95px] h-5 mr-2" />
              <Skeleton className="w-full h-40 mt-2" />
            </div>
            <Skeleton className="w-full h-[1px]" />
          </body>
          <footer className="min-h-[90px] justify-self-end flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-[70px] aspect-1 rounded-full" />
              <Skeleton className="w-[95px] h-5" />
            </div>

            <Skeleton className="w-[100px] h-10 " />
          </footer>
        </section>
        {/*--------------------------------------------------------------*/}
      </section>
    );
  if (error) return <></>;

  function currentCartQuantityOfProduct() {
    const productInCart = cart.find((item) => item.product._id == product._id);
    if (!productInCart) {
      return 0;
    } else {
      return productInCart.quantity;
    }
  }

  function increase() {
    if (quantity < product.availableStock) {
      setQuantity(quantity + 1);
    }
  }

  function decrease() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }

  function updateCart() {
    // console.log(`check before updateCart:\n productId: ${product._id}\n update quanitty:${currentCartQuantityOfProduct() + quantity} `)
    const currentProductQuanity = currentCartQuantityOfProduct();
    if (currentProductQuanity == 0) {
      addToCart(product._id, quantity);
    }
    updateCartItem(product._id, currentCartQuantityOfProduct() + quantity);
  }

  return (
    <section className="m-auto p-6 w-[90%] flex flex-col gap-6 md:flex-row md:justify-between">
      {/*---------------------------- product image -------------------*/}
      <div className="w-full md:w-[35%] md:min-h-[550px] aspect-[17/25]  p-6 bg-[#EEF1F1] flex justify-center items-center">
        <img
          src={product?.imageUrl}
          alt={`image about ${product?.name}`}
          className="w-auto h-[75%] object-contain"
        />
      </div>

      {/*---------------------------- product info-------------------*/}

      <section className="w-full md:w-[55%] md:min-h-full flex flex-col">
        <header>
          <div>
            <h1 className="font-medium text-3xl">{product?.name}</h1>
            <p className="text-lg">
              {Intl.NumberFormat('vi-VN').format(product?.price)} vnd
            </p>
          </div>

          <div className="flex gap-2 mt-12">
            <div className="w-[90px] h-[30px] border-[1px] border-[#E6E7E9] flex justify-between text-[20px] font-light rounded-[2px]">
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

            <button
              className="bg-[#1E7A5A] px-5 h-[30px] rounded-[2px]"
              onClick={() => {
                updateCart();
              }}
            >
              <p className="text-white text-center font-extralight text-sm">
                <AiOutlineShopping className="inline-block size-5" /> Add to
                cart
              </p>
            </button>
          </div>
          <p className="font-extralight text-sm text-[#B1B1B1] my-4">
            Available stock: {product?.availableStock}
          </p>
        </header>
        <body className="w-full h-full border-t-[1px] border-b-[1px] border-[#B1B1B1] py-3">
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
        </body>
        <footer className="min-h-[90px] justify-self-end flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-[70px] aspect-1 border-[1px] border-black rounded-full overflow-hidden ${vendor?.profilePicture == '' ? 'bg-[#eef1f1]' : ''}`}
            >
              {vendor?.profilePicture !== '' && (
                <img
                  className="w-full h-full object-contain"
                  src={vendor?.profilePicture}
                  alt={`this is image about vendor ${vendor?.businessName}`}
                />
              )}
            </div>
            <p className="text-lg font-extralight">{vendor?.businessName}</p>
          </div>

          <Link
            to={`/shop/${vendor?._id}`}
            className="text-[#1E7A5A] border-[1px] border-[#1E7A5A] hover:bg-[#1E7A5A] hover:text-white p-2"
          >
            Check shop
          </Link>
        </footer>
      </section>
      {/*--------------------------------------------------------------*/}
    </section>
  );
};

export default ProductDetail;
