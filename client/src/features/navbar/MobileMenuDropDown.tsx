import { useState } from 'react';
import { IoMdMenu } from 'react-icons/io';
import { Link } from 'react-router-dom';

type Role = 'CUSTOMER' | 'VENDOR' | 'SHIPPER' | null;

// Mobile dropdown menu
export default function MobileMenuDropDown({ role }: { role: Role }) {
  const [isOpen, setIsOpen] = useState(false);

  const menu = {
    customer: [
      { name: 'Shop', path: '/shop' },
      { name: 'Order', path: '/orders' },
    ],
    vendor: [
      { name: 'Product', path: '/products' },
      { name: 'Order', path: '/orders' },
    ],
    shipper: [{ name: 'Order', path: '/orders' }],
    null: [
      { name: 'Register', path: '/register' },
      { name: 'Login', path: '/login' },
    ],
  };

  return (
    <>
      <button className="block md:hidden" onClick={() => setIsOpen(!isOpen)}>
        <IoMdMenu className="size-8" />
      </button>

      {/*menu drop down*/}
      {isOpen && (
        <div className="absolute top-[55px] left-[-15px] w-screen md:hidden bg-white px-4 pb-4 space-y-2">
          {menu[role ?? 'null'].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="block py-2 text-gray-700 hover:text-green-600"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
