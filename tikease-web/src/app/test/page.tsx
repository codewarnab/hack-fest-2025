"use client";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutButton = () => {
  const [loading, setLoading] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // Dynamically load the Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => console.error("Failed to load Razorpay SDK");
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!isRazorpayLoaded) {
      alert("Razorpay SDK is not loaded. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 500, currency: "INR", receipt: "receipt#1" }),
      });

      const order = await res.json();

      const options = {
        key: "rzp_test_AjfwHh6xDIdedG", // Replace with your Razorpay Key ID
        amount: order.amount,
        currency: order.currency,
        name: "Your Company Name",
        description: "Test Transaction",
        order_id: order.id,
        handler: function (response: any) {
          alert(`Payment successful: ${response.razorpay_payment_id}`);
          // Verify the payment on the server
        },
        prefill: {
          name: "John Doe",
          email: "john.doe@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
};

export default CheckoutButton;