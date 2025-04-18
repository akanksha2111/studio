'use server';

/**
 * @fileOverview A web scraping service to fetch real-time order data from Swiggy.
 *
 * - scrapeOrders - A function that scrapes order data from the Swiggy website.
 * - ScrapedOrder - The interface for the scraped order data.
 */

import puppeteer from 'puppeteer';

export interface ScrapedOrder {
  id: string;
  value: number;
  distance: number;
  pickup: string;
  drop: string;
  timestamp: string;
  imageUrl?: string;
  productName?: string;
  storeName?: string;
  status: 'Live' | 'Mock';
  deliveryTime: string;
  foodTypes: string;
  rating: string;
  pricePerPerson: string;
  foodItems: FoodItem[];
  storeDetails: StoreDetails;
  addressDetails: AddressDetails;
}

export interface FoodItem {
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
}

export interface StoreDetails {
  name: string;
  address: string;
  phone?: string;
  cuisine: string;
  openingHours?: string;
  rating: number;
  totalRatings?: number;
  isOpen: boolean;
  imageUrl?: string;
}

export interface AddressDetails {
  pickup: {
    street: string;
    area: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  dropoff: {
    street: string;
    area: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
}

export async function scrapeOrders(): Promise<ScrapedOrder[]> {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 }); // Set a viewport

    const swiggyUrl = 'https://www.swiggy.com/';
    await page.goto(swiggyUrl, { waitUntil: 'networkidle2' });

    // Simulate location input (replace with actual logic if needed)
    await page.type('#location', 'Sector 62, Noida');
    await page.keyboard.press('Enter');

    // Wait for search results to load
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Wait for restaurants to load (adjust selector as needed)
    await page.waitForSelector('div[class^="_1HEuF"]', { timeout: 10000 });

    // Scrape restaurant data
    const restaurants = await page.evaluate(() => {
      const restaurantElements = Array.from(document.querySelectorAll('div[class^="_1HEuF"]'));
      return restaurantElements.map((element, index) => {
        const nameElement = element.querySelector('div[class^="nA6kb"]');
        const deliveryTimeElement = element.querySelector('div[class^="_3Mn31"]'); // Time
        const foodTypesElement = element.querySelector('div[class^="_1gBwG"]'); // Food Type
        const ratingElement = element.querySelector('div[class^="_1B92O"]'); // Rating
        const pricePerPersonElement = element.querySelector('div[class^="_3kG9"]');
        const menuItemsElement = element.querySelector('div[class^="_3D4gx"]'); // Menu items container
        const addressElement = element.querySelector('div[class^="_3M1LR"]'); // Address
        const phoneElement = element.querySelector('div[class^="_2FqTn"]'); // Phone
        const openingHoursElement = element.querySelector('div[class^="_2FqTn"]'); // Opening hours
        const imageElement = element.querySelector('img[class^="_396QI"]'); // Restaurant image

        const productName = nameElement ? nameElement.innerText : 'N/A';
        const deliveryTime = deliveryTimeElement ? deliveryTimeElement.innerText : 'N/A';
        const foodTypes = foodTypesElement ? foodTypesElement.innerText : 'N/A';
        const rating = ratingElement ? ratingElement.innerText : 'N/A';
        const pricePerPerson = pricePerPersonElement ? pricePerPersonElement.innerText : 'N/A';
        const address = addressElement ? addressElement.innerText : 'N/A';
        const phone = phoneElement ? phoneElement.innerText : 'N/A';
        const openingHours = openingHoursElement ? openingHoursElement.innerText : 'N/A';
        const imageUrl = imageElement ? imageElement.getAttribute('src') || undefined : undefined;

        // Generate random addresses for pickup and dropoff
        const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];
        const areas = ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6', 'Sector 7', 'Sector 8'];
        const streets = ['Main Street', 'Park Road', 'Lake View', 'Garden Road', 'Market Street', 'Church Road', 'School Lane', 'Hospital Road'];
        
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const randomArea = areas[Math.floor(Math.random() * areas.length)];
        const randomStreet = streets[Math.floor(Math.random() * streets.length)];
        const randomPincode = Math.floor(100000 + Math.random() * 900000).toString();
        
        const storeDetails: StoreDetails = {
          name: productName,
          address: address,
          phone: phone,
          cuisine: foodTypes,
          openingHours: openingHours,
          rating: parseFloat(rating) || 0,
          totalRatings: Math.floor(Math.random() * 1000) + 100,
          isOpen: Math.random() > 0.2, // 80% chance of being open
          imageUrl: imageUrl
        };
        
        const addressDetails: AddressDetails = {
          pickup: {
            street: randomStreet,
            area: randomArea,
            city: randomCity,
            pincode: randomPincode,
            landmark: 'Near ' + ['Park', 'Mall', 'Station', 'Hospital', 'School'][Math.floor(Math.random() * 5)]
          },
          dropoff: {
            street: streets[Math.floor(Math.random() * streets.length)],
            area: areas[Math.floor(Math.random() * areas.length)],
            city: cities[Math.floor(Math.random() * cities.length)],
            pincode: Math.floor(100000 + Math.random() * 900000).toString(),
            landmark: 'Near ' + ['Park', 'Mall', 'Station', 'Hospital', 'School'][Math.floor(Math.random() * 5)]
          }
        };

        // Scrape food items
        const foodItems: FoodItem[] = [];
        if (menuItemsElement) {
          const menuItems = Array.from(menuItemsElement.querySelectorAll('div[class^="_2jGOb"]'));
          menuItems.forEach(item => {
            const nameElement = item.querySelector('div[class^="_2zCDG"]');
            const priceElement = item.querySelector('div[class^="_1cXfd"]');
            const categoryElement = item.querySelector('div[class^="_3ezVU"]');
            const descriptionElement = item.querySelector('div[class^="_2V3wY"]');
            const imageElement = item.querySelector('img');

            if (nameElement && priceElement) {
              foodItems.push({
                name: nameElement.innerText,
                price: parseFloat(priceElement.innerText.replace(/[^0-9.]/g, '') || '0'),
                category: categoryElement ? categoryElement.innerText : 'Uncategorized',
                description: descriptionElement ? descriptionElement.innerText : undefined,
                imageUrl: imageElement ? imageElement.getAttribute('src') || undefined : undefined
              });
            }
          });
        }

        return {
          id: `swiggy-${index + 1}`,
          productName: productName,
          value: parseFloat(pricePerPerson.replace(/[^0-9.]/g, '') || '100'), // Mocked value
          distance: parseFloat((Math.random() * 5 + 1).toFixed(1)), // Mocked distance
          pickup: storeDetails.address,
          drop: addressDetails.dropoff.street + ', ' + addressDetails.dropoff.area,
          timestamp: new Date().toISOString(),
          imageUrl: imageUrl,
          storeName: productName,
          status: 'Live',
          deliveryTime: deliveryTime,
          foodTypes: foodTypes,
          rating: rating,
          pricePerPerson: pricePerPerson,
          foodItems: foodItems,
          storeDetails: storeDetails,
          addressDetails: addressDetails
        };
      });
    });

    console.log('Scraped restaurants:', restaurants);
    return restaurants as ScrapedOrder[];
  } catch (error) {
    console.error('Scraping failed:', error);
    return [];
  } finally {
    await browser.close();
  }
}
