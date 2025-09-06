// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import ShopCardItem from './ShopCardItem';
import { useShopProducts } from '../stores/ShopProductDataContext';

type ShopPageProps = {
  index: number; // current page index (1-based: 1, 2, 3, ...)
};

const ShopPage: React.FC<ShopPageProps> = ({ index }) => {
  const { products, loading, error } = useShopProducts();

  const ITEMS_PER_PAGE = 9;

  // calculate start + end indexes
  const start = (index - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;

  // slice products for this page
  const currentProducts = products.slice(start, end);

  if (loading) return <p>is Loading...</p>;
  if (error) return <p>{error}</p>;
  if (currentProducts.length === 0) return <p>No products found on this page.</p>;

  return (
    <div className="w-full h-auto grid grid-cols-1 gap-14 md:grid-cols-2 lg:grid-cols-3">
      {currentProducts.map((product) => (
        <ShopCardItem
          key={product._id}
          id={product._id}
          imgSrc={product.imageUrl}
          itemName={product.name}
          itemPrice={product.price}
        />
      ))}
    </div>
  );
};

export default ShopPage;
