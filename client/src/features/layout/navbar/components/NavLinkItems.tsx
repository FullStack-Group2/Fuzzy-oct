// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import { Link } from 'react-router-dom';
type Role = 'CUSTOMER' | 'VENDOR' | 'SHIPPER' | null;

export default function NavLinkItems({ role }: { role: Exclude<Role, null> }) {
  const menu = {
    CUSTOMER: [
      { name: 'Shop', path: '/shop' },
      { name: 'Order', path: `/customers/orders` },
    ],
    VENDOR: [
      { name: 'Product', path: '/products' },
      { name: 'Order', path: `/vendors/orders` },
      { name: 'View Message', path: '/chat' },
    ],
    SHIPPER: [{ name: 'Delivery', path: `/shippers/orders` }],
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
