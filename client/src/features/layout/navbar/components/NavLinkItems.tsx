import { Link } from 'react-router-dom';
type Role = 'CUSTOMER' | 'VENDOR' | 'SHIPPER' | null;

export default function NavLinkItems({ role }: { role: Exclude<Role, null> }) {
  const menu = {
    CUSTOMER: [
      { name: 'Shop', path: '/shop' },
      { name: 'Order', path: '/orders' },
    ],
    VENDOR: [
      { name: 'Product', path: '/products' },
      { name: 'Order', path: '/orders' },
    ],
    SHIPPER: [{ name: 'Order', path: '/orders' }],
  };

  return (
    <>
      {menu[role].map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className="text-gray-700 hover:text-green-600 hidden md:block"
        >
          {item.name}
        </Link>
      ))}
    </>
  );
}
