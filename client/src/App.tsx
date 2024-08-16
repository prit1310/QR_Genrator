import { useState, useEffect } from 'react';
import './App.css';


function App() {
  type Product = {
    name: string;
    price: number;
  };

  const [productList, setProductList] = useState<Product[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<number>(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Determine base URL depending on the environment
  const baseUrl = process.env.NODE_ENV === 'production' 
                  ? 'https://qr-genrator.onrender.com' 
                  : 'http://localhost:5000';

  const generateQrCodeUrl = async () => {
    try {
      const response = await fetch(`${baseUrl}/qrcode?totalAmount=${totalAmount}`);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const sendTotalAmount = async () => {
    try {
      const response = await fetch(`${baseUrl}/update-total`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ totalAmount }),
      });
      const result = await response.json();
      console.log("Server response:", result);
    } catch (error) {
      console.error("Error sending total amount:", error);
    }
  };

  useEffect(() => {
    if (totalAmount > 0) {
      generateQrCodeUrl();
    }
  }, [totalAmount]);

  const addProduct = () => {
    const newProduct: Product = {
      name: productName,
      price: productPrice,
    };
    setProductList([...productList, newProduct]);
    setTotalAmount(totalAmount + productPrice);
    setProductName("");
    setProductPrice(0);

    // Send the updated total amount to the backend
    sendTotalAmount();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-10">QR Generator</h1>

        <div className="product-input flex flex-col items-center bg-white p-8 rounded-lg shadow-lg space-y-4 w-full max-w-md">
          <input
            type="text"
            value={productName}
            placeholder="Product Name"
            className="border-2 border-gray-300 rounded-lg p-3 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
            onChange={(e) => setProductName(e.target.value)}
          />
          <input
            type="number"
            value={productPrice}
            placeholder="Product Price"
            className="border-2 border-gray-300 rounded-lg p-3 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
            onChange={(e) => setProductPrice(Number(e.target.value))}
          />
          <button
            onClick={addProduct}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition transform hover:scale-105"
          >
            Add Product
          </button>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mt-12">Product List</h2>
        <ul className="mt-6 space-y-4 w-full max-w-lg">
          {productList.map((product, index) => (
            <li key={index} className="text-lg flex justify-between items-center bg-white p-4 rounded-lg shadow">
              <span className="text-gray-700">{product.name}</span>
              <span className="text-blue-600 font-semibold">₹{product.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-3xl font-bold text-gray-800 mt-10">
          Total Amount: <span className="text-yellow-500">₹{totalAmount.toFixed(2)}</span>
        </h2>

        {qrCodeUrl && (
          <div className="mt-10 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">QR Code</h2>
            <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 object-contain" />
          </div>
        )}
      </div>
    </>
  );
}

export default App;
