import { useEffect, useState } from "react";

interface IProductDetail {
  productId: string;
}
export const ProductDetail: React.FC<IProductDetail> = ({ productId }) => {

  // fetch data later
  useEffect(() =>{
    // fetch()
  }, [productId])
  const product = {
    "name": "Aurora Chair",
    "image": null,
    "price": 750000,
    "availableStock": 100,
    "categories": "Chairs and seating",
    "description": "The Aurora Chair features graceful curves and a timeless silhouette, crafted from premium wood and hand-polished to perfection. Its ergonomic form offers lasting comfort, while refined details bring sophistication to any room. Ideal for dining, living, or workspace, it blends style and durability, enhancing interiors with an elegant, versatile presence."
  }



  const [quantity, setQuantity] = useState(0);

  let handleAddItem = () => {
    setQuantity(quantity + 1)
  }

  let handleMinusItem = () => {
    quantity == 0 ? setQuantity(0) : setQuantity(quantity - 1)

  }
  return (
    <>
      <div className="grid items-start grid-cols-1 md:grid-cols-2 gap-8 max-lg:gap-12 max-sm:gap-8 space-y-5">

        <div className="flex justify-center items-center py-5">
          <img
            src="https://picsum.photos/id/237/500/600"
          />
        </div>

        <div >
          <div className="space-y-[45px]">
            <div >
              <h2 className="font-bold text-black text-[35px]">{product.name}</h2>
              <div className="flex items-center flex-wrap gap-4 ">
                <h4 className="text-gray-800 text-2xl  font-bold">{product.price} vnd</h4>
                <p className="text-gray-500 text-md"><s>{product.price - 50000} vnd</s> <span className="text-sm ml-1.5">Tax included</span></p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 ">
                  <button className="px-3 py-1  rounded-sm bg-[#1E7A5A] text-white font-bold" onClick={() => handleMinusItem()}>-</button>
                  <button>{quantity}</button>
                  <button className="px-3 py-1  rounded-sm bg-[#1E7A5A] text-white font-bold" onClick={() => handleAddItem()}>+</button>
                </div>
                <button className="px-3 py-1 w-[150px] rounded-sm bg-[#1E7A5A] text-white" disabled={quantity === 0}>Add to Cart</button>
              </div>

              <div className="mt-2">
                <h4 className="text-gray-400 text-sm">Available stock: {product.availableStock}</h4>
                <hr className="border-t border-gray-300 my-4 w-[600px]" />
              </div>
            </div>

          </div>

          <div >
            {/* Category */}
            <span className="flex items-center gap-2 ">
              <p className="font-bold m-0">Categories:</p>
              <span className="text-gray-400">{product.categories}</span>
            </span>


            {/* Description */}
            <span className=" ">
              <p className="font-bold m-0">Description:</p>
              <p className="w-[600px] break-words">{product.description}</p>
            </span>

          </div>

          <div className="mt-12 ">

            {/* Dash */}
            <hr className="border-t border-gray-300 my-4 w-[600px]" />

            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="">
                <img
                  src="https://picsum.photos/id/237/500/600"
                  className="w-16 h-16 rounded-full"
                />
              </div>

              {/* Store name */}
              <p className="text-ellipsis">SHOP STORE NAME</p>

              {/* Check shop info */}
              <button className="px-2 py-1 w-[150px] rounded-sm border border-[#1E7A5A] text-[#1E7A5A]">Check shop</button>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProductDetail;
