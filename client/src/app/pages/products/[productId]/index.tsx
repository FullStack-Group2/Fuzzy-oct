import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // fetch data 
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5001/products/${id}`, {
          method: "GET",
        });
        const product = await response.json();
        setItem(product)

        const response2 = await fetch(`http://localhost:5001/api/${product.vendor}`, {
          method: "GET",
        });
        const shop = await response2.json();
        setShop(shop)

      } catch (err) {
        console.log('failed to fetch')
      }
    }
    fetchProduct();
  }, [id])

  const [item, setItem] = useState({
    "name": null,
    "imageUrl": undefined,
    "price": 0,
    "availableStock": null,
    "categories": null, // missing
    "description": null,
    "vendor": null,
    "salePercentage": 0 // missing
  })
  const [quantity, setQuantity] = useState(0);
  const [shop, setShop] = useState({
    "profilePicture": "",
    "businessName": "",
    "_id": "",
  });

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
            src={item.imageUrl}
            alt={"Product Image"}
          />
        </div>

        <div >
          <div className="space-y-[45px]">
            <div >
              <h2 className="font-bold text-black text-[35px]">{item.name}</h2>
              <div className="flex items-center flex-wrap gap-4 ">
                <h4 className="text-gray-800 text-2xl  font-bold">{item.price} vnd</h4>

                {/* Sale */}
                {item.salePercentage != 0 && < p className="text-gray-500 text-md"><s>{item.price * (1 - item.salePercentage)} vnd</s> <span className="text-sm ml-1.5">Tax included</span></p>}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 ">
                  <button className="px-3 py-1  rounded-sm bg-white font-bold" onClick={() => handleMinusItem()}>-</button>
                  <button>{quantity}</button>
                  <button className="px-3 py-1  rounded-sm bg-white font-bold" onClick={() => handleAddItem()}>+</button>
                </div>
                <button className="px-3 py-1 w-[150px] rounded-sm bg-[#1E7A5A] text-white" disabled={quantity === 0}>Add to Cart</button>
              </div>

              <div className="mt-2">
                <h4 className="text-gray-400 text-sm">Available stock: {item.availableStock}</h4>
                <hr className="border-t border-gray-300 my-4 w-[600px]" />
              </div>
            </div>

          </div>

          <div >
            {/* Category */}
            <span className="flex items-center gap-2 ">
              <p className="font-bold m-0">Categories:</p>
              <span className="text-gray-400">{item.categories}</span>
            </span>


            {/* Description */}
            <span className=" ">
              <p className="font-bold m-0">Description:</p>
              <p className="w-[600px] break-words">{item.description}</p>
            </span>

          </div>

          <div className="mt-12 ">

            {/* Dash */}
            <hr className="border-t border-gray-300 my-4 w-[600px]" />

            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="">
                <img
                  src={shop.profilePicture}
                  className="w-16 h-16 rounded-full"
                />
              </div>

              {/* Store name */}
              <p className="text-ellipsis">{shop.businessName}</p>

              {/* Check shop info */}
              {/* Href go to the place by _id */}
              <button className="px-2 py-1 w-[150px] rounded-sm border border-[#1E7A5A] text-[#1E7A5A]" onClick={() => { }}>Check shop</button>

            </div>
          </div>

        </div>
      </div >
    </>
  );
};

export default ProductDetail;
