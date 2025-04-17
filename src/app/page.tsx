"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Location, getCurrentLocation } from "@/services/geolocation";
import { scrapeOrders, ScrapedOrder } from "@/services/order-scraper";
import { Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Order extends ScrapedOrder {}

const mockOrders: Order[] = [
  {
    id: "1",
    value: 50,
    distance: 2.5,
    pickup: "Restaurant A",
    drop: "Customer X",
    timestamp: new Date().toISOString(),
    status: "Mock",
    deliveryTime: "25-30 mins",
    foodTypes: "Burger, Fast Food",
    rating: "4.2",
    pricePerPerson: "₹200",
  },
  {
    id: "2",
    value: 75,
    distance: 3.0,
    pickup: "Restaurant B",
    drop: "Customer Y",
    timestamp: new Date().toISOString(),
    status: "Mock",
    deliveryTime: "30-35 mins",
    foodTypes: "Pizza, Italian",
    rating: "4.5",
    pricePerPerson: "₹300",
  },
  {
    id: "3",
    value: 120,
    distance: 4.2,
    pickup: "Restaurant C",
    drop: "Customer Z",
    timestamp: new Date().toISOString(),
    status: "Mock",
    deliveryTime: "40-45 mins",
    foodTypes: "Sushi, Japanese",
    rating: "4.7",
    pricePerPerson: "₹500",
  },
];

export default function Home() {
  const [walletBalance, setWalletBalance] = useState<number>(2000);
  const [acceptedOrders, setAcceptedOrders] = useState<string[]>([]);
  const [nearbyOrders, setNearbyOrders] = useState<Order[]>(mockOrders);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null); // New state for wallet error

  useEffect(() => {
    const fetchLocation = async () => {
      const loc = await getCurrentLocation();
      setCurrentLocation(loc);
    };

    fetchLocation();

    // Fetch new orders periodically
    const intervalId = setInterval(async () => {
      const scrapedOrders = await scrapeOrders();
      setNearbyOrders((prevOrders) => [...prevOrders, ...scrapedOrders]);
    }, 60000); // Fetch every 60 seconds

    return () => clearInterval(intervalId);
  }, []);

  const calculateTotalOrderValue = () => {
    return acceptedOrders.reduce((acc, orderId) => {
      const order = nearbyOrders.find((order) => order.id === orderId);
      return order ? acc + order.value : acc;
    }, 0);
  };

  const canAcceptOrder = (orderValue: number) => {
    return walletBalance >= calculateTotalOrderValue() + orderValue;
  };

  const acceptOrder = (orderId: string, orderValue: number) => {
    if (canAcceptOrder(orderValue)) {
      setAcceptedOrders([...acceptedOrders, orderId]);
      setWalletError(null); // Clear any existing error
    } else {
      setWalletError("Cannot accept order: insufficient wallet balance"); // Set the error message
    }
  };

  const rejectOrder = (orderId: string) => {
    setAcceptedOrders(acceptedOrders.filter((id) => id !== orderId));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SwiftWheels Driver Dashboard</h1>

      {walletError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{walletError}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>₹{walletBalance}</CardContent>
      </Card>

      {currentLocation && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Current Location</CardTitle>
          </CardHeader>
          <CardContent>
            Lat: {currentLocation.lat}, Lng: {currentLocation.lng}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nearbyOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle>Order #{order.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <Badge>Value: ₹{order.value}</Badge>
                <Badge className="ml-2">Distance: {order.distance} km</Badge>
              </div>
              <div>Store: {order.storeName}</div>
              <div>Item: {order.productName}</div>
              <div>Pickup: {order.pickup}</div>
              <div>Dropoff: {order.drop}</div>
              <div>
                Time: {new Date(order.timestamp).toLocaleTimeString()}
              </div>
              <div className="mt-4 flex gap-2">
                {!acceptedOrders.includes(order.id) ? (
                  <Button
                    variant="outline"
                    onClick={() => acceptOrder(order.id, order.value)}
                    disabled={!canAcceptOrder(order.value)}
                  >
                    Accept
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => rejectOrder(order.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
