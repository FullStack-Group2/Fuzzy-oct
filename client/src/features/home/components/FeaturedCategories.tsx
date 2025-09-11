import { GoHeartFill } from 'react-icons/go';
import { Link } from 'react-router-dom';

export default function FeaturedCategories() {
  return (
    <div className="w-full flex flex-col items-center justify-center lg:flex-row gap-20 py-24">
      <h1 className="text-3xl font-semibold">
        Featured Categories{' '}
        <GoHeartFill className="text-red-500 inline-block" />
      </h1>

      <Link className="relative" to="/shop?page=1&category=CABINETS">
        <img src="/home/cabinetIcon.webp" alt="cabinet icon" />
        <p>Cabinet</p>
      </Link>

      <Link className="relative" to="/shop?page=1&category=CHAIRS">
        <img src="/home/chairIcon.webp" alt="chair icon" />
        <p>Chair</p>
      </Link>

      <Link className="relative" to="/shop?page=1&category=SOFAS">
        <img src="/home/sofaIcon.webp" alt="sofa icon" />
        <p>Sofa</p>
      </Link>

      <Link className="relative" to="/shop?page=1&category=SHELVES">
        <img src="/home/shelveIcon.webp" alt="shelve icon" />
        <p>Shelve</p>
      </Link>
    </div>
  );
}
