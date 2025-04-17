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

        const productName = nameElement ? nameElement.innerText : 'N/A';
        const deliveryTime = deliveryTimeElement ? deliveryTimeElement.innerText : 'N/A';
        const foodTypes = foodTypesElement ? foodTypesElement.innerText : 'N/A';
        const rating = ratingElement ? ratingElement.innerText : 'N/A';
        const pricePerPerson = pricePerPersonElement ? pricePerPersonElement.innerText : 'N/A';

        return {
          id: `swiggy-${index + 1}`,
          productName: productName,
          value: parseFloat(pricePerPerson.replace(/[^0-9.]/g, '') || '100'), // Mocked value
          distance: parseFloat((Math.random() * 5 + 1).toFixed(1)), // Mocked distance
          pickup: 'Swiggy Restaurant', // Mocked pickup
          drop: 'Customer Address',    // Mocked drop
          timestamp: new Date().toISOString(),
          imageUrl: '',
          storeName: 'Swiggy',
          status: 'Live',
          deliveryTime: deliveryTime,
          foodTypes: foodTypes,
          rating: rating,
          pricePerPerson: pricePerPerson
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
