import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';
import { Button } from '@/components/ui/button';
import { UploadIcon } from '@radix-ui/react-icons';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  vendor: string;
  availableStock: number;
  salesCount?: number;
}

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const token = `Bearer ${localStorage.getItem('token') || ''}`;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/vendors/products', {
          headers: {
            Authorization: token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const productsWithSales = await Promise.all(
            data.products.map(async (product: Product) => {
              const salesResponse = await fetch(
                `http://localhost:5001/api/vendors/product/${product._id}/sales`,
                {
                  headers: {
                    Authorization: token,
                  },
                },
              );

              if (salesResponse.ok) {
                const salesData = await salesResponse.json();
                return { ...product, salesCount: salesData.totalSold || 0 };
              } else {
                console.error(`Failed to fetch sales for product ${product._id}`);
                return { ...product, salesCount: 0 };
              }
            }),
          );
          setProducts(productsWithSales);
        } else {
          console.error('Failed to fetch products');
          alert('Failed to load products. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        alert('An error occurred while fetching products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  const handleDelete = async (productId: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this product?',
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/vendors/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: token,
          },
        },
      );

      if (response.ok) {
        alert('Product deleted successfully');
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId),
        );
      } else {
        console.error('Failed to delete product');
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN'); // Format price in VND format
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();

    // File Title
    doc.setFontSize(18);
    doc.text('Product List', 14, 20);

    // Define table headers and rows
    autoTable(doc, {
      head: [['Name', 'Price', 'Sold', 'Available Stock']],
      body: products.map((product) => [
        product.name,
        `${formatPrice(product.price)} vnd`, // Format price in PDF export
        product.salesCount || 0,
        product.availableStock,
      ]),
      startY: 30, // Start the table below the title
    });

    // Save the PDF
    doc.save('product_list.pdf');
  };

  return (
    <div className="p-6">

      <div className="flex flex-col  [@media(min-width:375px)]:flex-row 
        justify-between items-start 
        mb-3 md:mb-6 mx-5 md:mx-10
      ">
        <h1 className='font-bold text-2xl lg:text-4xl mb-4 [@media(min-width:490px)]:mb-0'>Products</h1>

        <div className="flex flex-col [@media(min-width:375px)]:flex-col [@media(min-width:551px)]:flex-row [@media(min-width:551px)]:space-x-4">
          <button
            type="button"
            onClick={handleExportToPDF}
            className="bg-white border-2 border-[#1E7A5A] text-[#1E7A5A] px-4 py-2 rounded-lg hover:bg-[#289E75] 
              transition-colors 
              flex items-center space-x-2
              mb-4 
            "
          >
            <UploadIcon className='text-[#1E7A5A]' />
            <span className='text-md lg:text-lg'>Export Products</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/products/add')}
            className="bg-[#1E7A5A] text-white text-md lg:text-lg px-4 py-2 rounded-lg hover:bg-[#289E75] transition-colors w-41 h-11 [@media(min-width:1024px)]:h-12"
          >
            Add Product
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-600">Loading products...</div>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-8 text-gray-600">No products found.</div>
      )}

      {!loading && products.length > 0 && (
        <div className="border-2 border-[#E8E8E9] rounded-t-lg mx-5 md:mx-10 overflow-hidden">
          <Table className="text-md lg:text-lg">
            <TableHeader className="bg-[#FCFCFC] border-b-4 border-[#E8E8E9]">
              <TableRow className="h-16">
                <TableHead className="text-black lg:pl-8">Product Name</TableHead>
                <TableHead className="text-black">Price</TableHead>
                <TableHead className="text-black">Sold</TableHead>
                <TableHead className="text-black">Available</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id} className="border-b-2 border-[#E8E8E9]">
                  <TableCell className="font-medium text-left lg:pl-8">
                    <div className="flex flex-col md:flex-row items-center md:space-x-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-16 lg:h-20 w-12 lg:w-16"
                      />
                      <span className="text-left">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">{formatPrice(product.price)} vnd</TableCell>
                  <TableCell className="text-gray-500">{product.salesCount || 0}</TableCell>
                  <TableCell className="text-gray-500">{product.availableStock}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col md:flex-row justify-evenly space-y-2 md:space-x-4 md:space-y-0">
                        <Button 
                        className="w-16 lg:w-28 text-md lg:text-lg"
                        onClick={() =>
                            navigate(`/products/${product._id}/edit`, { state: { product } })
                        }
                        >
                        Edit
                        </Button>
                    
                        <Button
                        className="bg-red-600 text-white hover:bg-red-500 w-16 lg:w-28 text-md lg:text-lg"
                        onClick={() => handleDelete(product._id)}
                        >
                        Delete
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Products;
