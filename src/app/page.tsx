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
    foodItems: [
      {
        name: "Classic Burger",
        price: 199,
        category: "Burgers",
        description: "Juicy beef patty with fresh vegetables"
      },
      {
        name: "French Fries",
        price: 99,
        category: "Sides",
        description: "Crispy golden fries"
      }
    ],
    storeDetails: {
      name: "Burger King",
      address: "123 Main Street, Sector 1, Mumbai",
      phone: "+91 9876543210",
      cuisine: "Burger, Fast Food",
      openingHours: "10:00 AM - 10:00 PM",
      rating: 4.2,
      totalRatings: 1250,
      isOpen: true,
      imageUrl: "https://example.com/burger-king.jpg"
    },
    addressDetails: {
      pickup: {
        street: "123 Main Street",
        area: "Sector 1",
        city: "Mumbai",
        pincode: "400001",
        landmark: "Near City Mall"
      },
      dropoff: {
        street: "456 Park Road",
        area: "Sector 2",
        city: "Mumbai",
        pincode: "400002",
        landmark: "Near Central Park"
      }
    }
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
    foodItems: [
      {
        name: "Margherita Pizza",
        price: 299,
        category: "Pizza",
        description: "Classic tomato and mozzarella"
      },
      {
        name: "Garlic Bread",
        price: 149,
        category: "Sides",
        description: "Toasted with garlic butter"
      }
    ],
    storeDetails: {
      name: "Pizza Hut",
      address: "456 Lake View, Sector 3, Delhi",
      phone: "+91 9876543211",
      cuisine: "Pizza, Italian",
      openingHours: "11:00 AM - 11:00 PM",
      rating: 4.5,
      totalRatings: 980,
      isOpen: true,
      imageUrl: "https://example.com/pizza-hut.jpg"
    },
    addressDetails: {
      pickup: {
        street: "456 Lake View",
        area: "Sector 3",
        city: "Delhi",
        pincode: "110001",
        landmark: "Near Lake View Mall"
      },
      dropoff: {
        street: "789 Garden Road",
        area: "Sector 4",
        city: "Delhi",
        pincode: "110002",
        landmark: "Near Garden Park"
      }
    }
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
    foodItems: [
      {
        name: "California Roll",
        price: 399,
        category: "Sushi",
        description: "Crab, avocado, cucumber"
      },
      {
        name: "Miso Soup",
        price: 199,
        category: "Soups",
        description: "Traditional Japanese soup"
      }
    ],
    storeDetails: {
      name: "Sushi Master",
      address: "789 Market Street, Sector 5, Bangalore",
      phone: "+91 9876543212",
      cuisine: "Sushi, Japanese",
      openingHours: "12:00 PM - 10:00 PM",
      rating: 4.7,
      totalRatings: 750,
      isOpen: true,
      imageUrl: "https://example.com/sushi-master.jpg"
    },
    addressDetails: {
      pickup: {
        street: "789 Market Street",
        area: "Sector 5",
        city: "Bangalore",
        pincode: "560001",
        landmark: "Near Central Market"
      },
      dropoff: {
        street: "321 Church Road",
        area: "Sector 6",
        city: "Bangalore",
        pincode: "560002",
        landmark: "Near City Church"
      }
    }
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
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Store Information:</h4>
                <div className="text-sm space-y-1">
                  <div className="flex items-center">
                    <span className="font-medium">Name:</span>
                    <span className="ml-2">{order.storeDetails.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Cuisine:</span>
                    <span className="ml-2">{order.storeDetails.cuisine}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Rating:</span>
                    <span className="ml-2">{order.storeDetails.rating} ({order.storeDetails.totalRatings} ratings)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 ${order.storeDetails.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                      {order.storeDetails.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Pickup Location:</h4>
                <div className="text-sm space-y-1">
                  <div>{order.addressDetails.pickup.street}</div>
                  <div>{order.addressDetails.pickup.area}, {order.addressDetails.pickup.city}</div>
                  <div>Pincode: {order.addressDetails.pickup.pincode}</div>
                  {order.addressDetails.pickup.landmark && (
                    <div className="text-gray-500">{order.addressDetails.pickup.landmark}</div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Dropoff Location:</h4>
                <div className="text-sm space-y-1">
                  <div>{order.addressDetails.dropoff.street}</div>
                  <div>{order.addressDetails.dropoff.area}, {order.addressDetails.dropoff.city}</div>
                  <div>Pincode: {order.addressDetails.dropoff.pincode}</div>
                  {order.addressDetails.dropoff.landmark && (
                    <div className="text-gray-500">{order.addressDetails.dropoff.landmark}</div>
                  )}
                </div>
              </div>
              
              {order.foodItems && order.foodItems.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Food Items:</h4>
                  <div className="space-y-2">
                    {order.foodItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 ml-2">({item.category})</span>
                        </div>
                        <span className="text-green-600">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
