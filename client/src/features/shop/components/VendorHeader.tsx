import { Link, useParams } from 'react-router-dom';
import { useShopProducts } from '../stores/ShopProductDataContext';
import { Skeleton } from '@/components/ui/skeleton';
export default function VendorHeader() {
  const { shopId } = useParams<{ shopId?: string }>();
  const { data, loading, error } = useShopProducts();

  if (!shopId) return <></>;
  if (loading)
    return (
      <header className="w-full mb-10">
        <div className="flex items-center gap-3">
          <Skeleton className="w-[70px] aspect-1 rounded-full" />
          <Skeleton className="w-[150px] h-6" />
        </div>
      </header>
    );
  if (error) return <></>;

  return (
    <header className="w-full mb-10">
      <div className="flex items-center gap-3">
        <div
          className={`w-[70px] aspect-1 border-[1px] border-black rounded-full overflow-hidden ${data?.vendor?.profilePicture == '' ? 'bg-[#eef1f1]' : ''}`}
        >
          {data?.vendor?.profilePicture !== '' && (
            <img
              className="w-full h-full object-contain"
              src={data?.vendor?.profilePicture}
              alt={`this is image about vendor ${data?.vendor?.businessName}`}
            />
          )}
        </div>
        <p className="text-lg font-extralight">{data?.vendor?.businessName}</p>

        <Link
          to={`/chat/${1}/${data?.vendor?._id}`} // senderId
          className="text-[#1E7A5A] border border-[#1E7A5A] hover:bg-[#1E7A5A] hover:text-white p-2 rounded"
        >
          Chat with vendor
        </Link>
      </div>
    </header>
  );
}
