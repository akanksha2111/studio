"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Location, getCurrentLocation } from "@/services/geolocation";

interface Order {
  id: string;
  value: number;
  items: string[];
  pickupLocation: string;
  dropLocation: string;
  estimatedDeliveryTime: string;
}

const mockOrders: Order[] = [
  {
    id: "1",
    value: 50,
    items: ["Burger", "Fries", "Coke"],
    pickupLocation: "Restaurant A",
    dropLocation: "Customer X",
    estimatedDeliveryTime: "30 minutes",
  },
  {
    id: "2",
    value: 75,
    items: ["Pizza", "Salad"],
    pickupLocation: "Restaurant B",
    dropLocation: "Customer Y",
    estimatedDeliveryTime: "45 minutes",
  },
  {
    id: "3",
    value: 120,
    items: ["Sushi", "Sake"],
    pickupLocation: "Restaurant C",
    dropLocation: "Customer Z",
    estimatedDeliveryTime: "60 minutes",
  },
];

export default function Home() {
  const [walletBalance, setWalletBalance] = useState<number>(200);
  const [acceptedOrders, setAcceptedOrders] = useState<string[]>([]);
  const [nearbyOrders, setNearbyOrders] = useState<Order[]>(mockOrders);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const loc = await getCurrentLocation();
      setCurrentLocation(loc);
    };

    fetchLocation();
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
    } else {
      alert("Cannot accept order: insufficient wallet balance");
    }
  };

  const rejectOrder = (orderId: string) => {
    setAcceptedOrders(acceptedOrders.filter((id) => id !== orderId));
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          ₹{walletBalance}
        </CardContent>
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
              </div>
              <div>Items: {order.items.join(", ")}</div>
              <div>Pickup: {order.pickupLocation}</div>
              <div>Dropoff: {order.dropLocation}</div>
              <div>Time: {order.estimatedDeliveryTime}</div>
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
                    Reject
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
