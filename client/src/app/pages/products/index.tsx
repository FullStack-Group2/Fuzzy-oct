// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Tran Tu Tam
// ID: s3999159

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
import toast from 'react-hot-toast';

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
        const response = await fetch(
          'http://localhost:5001/api/vendors/products',
          {
            headers: {
              Authorization: token,
            },
          },
        );

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
                console.error(
                  `Failed to fetch sales for product ${product._id}`,
                );
                return { ...product, salesCount: 0 };
              }
            }),
          );
          setProducts(productsWithSales);
        } else {
          console.error('Failed to fetch products');
          toast.error('Failed to load products. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('An error occurred while fetching products.');
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
        `http://localhost:5001/api/vendors/product/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: token,
          },
        },
      );

      if (response.ok) {
        toast.success('Product deleted successfully');
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId),
        );
      } else {
        console.error('Failed to delete product');
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN'); // Format price in VND format
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Product List', 14, 20);

    autoTable(doc, {
      head: [['Name', 'Price', 'Sold', 'Available Stock']],
      body: products.map((product) => [
        product.name,
        `${formatPrice(product.price)} vnd`,
        product.salesCount || 0,
        product.availableStock,
      ]),
      startY: 30,
    });

    doc.save('product_list.pdf'); 
  };

  return (
    <section className="w-full my-10">
      <header className="relative mb-5 w-full h-56 bg-[#B7F7E1]">
        <img
          src="/backgroundCover.png"
          alt="background cover for product header"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center text-black text-5xl font-semibold">
          Product page
        </div>
      </header>

      <div
        className="flex flex-col 
        justify-between
        mb-3 md:mb-6 mx-5 md:mx-10
      "
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleExportToPDF}
            className="group bg-white border border-[#1E7A5A] text-[#1E7A5A] text-sm font-extralight px-4 py-2 rounded-sm hover:bg-black hover:text-white
              transition-colors 
              flex items-center justify-center space-x-2
            "
          >
            <UploadIcon className="text-[#1E7A5A] group-hover:text-white" />
            <span className="text-md lg:text-lg">Export Products</span>
          </button>

          <button
            onClick={() => navigate('/products/add')}
            className="bg-[#1E7A5A] text-white text-sm font-extralight px-4 py-2 rounded-sm hover:bg-[#289E75] transition-colors"
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
        <div className="border border-[#E8E8E9] rounded-t-lg mx-5 md:mx-10 overflow-hidden">
          <Table className="text-md lg:text-lg">
            <TableHeader className="bg-[#FCFCFC] border-b-[1px] border-[#E8E8E9]">
              <TableRow className="h-16">
                <TableHead className="text-black lg:pl-8">
                  Product Name
                </TableHead>
                <TableHead className="text-black">Price</TableHead>
                <TableHead className="text-black">Sold</TableHead>
                <TableHead className="text-black">Available</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product._id}
                  className="border-b-[1px] border-[#E8E8E9]"
                >
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
                  <TableCell className="text-gray-500">
                    {formatPrice(product.price)} vnd
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {product.salesCount || 0}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {product.availableStock}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col sm:flex-row justify-evenly space-y-2 sm:space-x-4 sm:space-y-0">
                      <Button
                        className="w-16 lg:w-28 text-md font-extralight rounded-sm bg-black hover:bg-black/20"
                        onClick={() =>
                          navigate(`/products/${product._id}/edit`, {
                            state: { product },
                          })
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        className="bg-red-600 text-white hover:bg-red-500 w-16 lg:w-28 text-md font-extralight rounded-sm"
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
    </section>
  );
};

export default Products;
