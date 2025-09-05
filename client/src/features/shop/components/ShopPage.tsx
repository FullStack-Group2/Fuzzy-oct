import { useEffect } from 'react';
import toast from 'react-hot-toast';

import ShopCardItem from './ShopCardItem';
import { useShopProducts } from '../stores/ShopProductDataContext';
import { Skeleton } from '@/components/ui/skeleton';

const ShopPage: React.FC = () => {
  const 
  { data, loading, error } = useShopProducts();
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading)
    return (
      <body className="w-full h-auto grid grid-cols-1 gap-14 md:grid-cols-2 lg:grid-cols-3 my-10">
        <Skeleton className="w-full aspect-[17/25]" />
        <Skeleton className="w-full aspect-[17/25]" />
        <Skeleton className="w-full aspect-[17/25]" />
        <Skeleton className="w-full aspect-[17/25]" />
        <Skeleton className="w-full aspect-[17/25]" />
        <Skeleton className="w-full aspect-[17/25]" />
      </body>
    );
  if (error) return <></>;

  return (
    <body className="w-full h-auto grid grid-cols-1 gap-14 md:grid-cols-2 lg:grid-cols-3 my-10">
      {data.products.map((product: any) => (
        <ShopCardItem
          key={product._id}
          id={product._id}
          imgSrc={product.imageUrl}
          itemName={product.name}
          itemPrice={product.price}
        />
      ))}
    </body>
  );
};

export default ShopPage;
