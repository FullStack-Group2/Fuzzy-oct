import FilterBar from '@/features/shop/FilterBar';
import ShopCardItem from '@/features/shop/ShopCardItem';

const Shop = () => {
  return (
    <>
      <header className="relative mb-5 w-screen h-48 bg-[#B7F7E1]">
        <img
          src="/backgroundCover.png"
          alt="background cover for shop header"
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 flex items-center justify-center text-black text-5xl font-semibold">
          Shop page
        </div>
      </header>

      <section className="w-[90vw] mx-auto mb-5 flex flex-col md:flex-row md:justify-between gap-5">
        <FilterBar />

        <div className="w-full h-auto grid grid-cols-1 gap-14 md:w-[73%] sm:grid-cols-2 md:grid-cols-3">
          <ShopCardItem
            imgSrc="/verona-seat.png"
            itemName="Verona Seat"
            itemPrice="950.000"
          />
          <ShopCardItem
            imgSrc="/verona-seat.png"
            itemName="Verona Seat"
            itemPrice="950.000"
          />
          <ShopCardItem
            imgSrc="/verona-seat.png"
            itemName="Verona Seat"
            itemPrice="950.000"
          />
          <ShopCardItem
            imgSrc="/verona-seat.png"
            itemName="Verona Seat"
            itemPrice="950.000"
          />
          <ShopCardItem
            imgSrc="/verona-seat.png"
            itemName="Verona Seat"
            itemPrice="950.000"
          />
          <ShopCardItem
            imgSrc="/verona-seat.png"
            itemName="Verona Seat"
            itemPrice="950.000"
          />
          <ShopCardItem
            imgSrc="/verona-seat.png"
            itemName="Verona Seat"
            itemPrice="950.000"
          />
          <ShopCardItem
            imgSrc="/verona-seat.png"
            itemName="Verona Seat"
            itemPrice="950.000"
          />
          <ShopCardItem
            imgSrc="/verona-seat.png"
            itemName="Verona Seat"
            itemPrice="950.000"
          />
          <ShopCardItem
            imgSrc="/verona-seat.png"
            itemName="Verona Seat"
            itemPrice="950.000"
          />
          <ShopCardItem
            imgSrc="/verona-seat.png"
            itemName="Verona Seat"
            itemPrice="950.000"
          />
        </div>
      </section>
    </>
  );
};

export default Shop;
