
const Navbar = () => {
  const role = null; 

  return (
    <>
      {role == 'customer' && <></>}
      {role == 'vendor' && <></>}
      {role == 'shipper' && <></>}
    </>
  );
};

export default Navbar;
