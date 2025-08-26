import ShopCardItem from "./ShopCardItem";
type ShopPageProps = {
  index: number;
};
const ShopPage: React.FC<ShopPageProps> = ({ index }) => {
  return (
    <div className="w-full h-auto grid grid-cols-1 gap-14 sm:grid-cols-2 md:grid-cols-3">
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
  );
};
{
}
export default ShopPage;
