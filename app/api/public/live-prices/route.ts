import { NextRequest, NextResponse } from 'next/server';

// Fallback prices if API fails
const FALLBACK_PRICES = {
  gold: 6500,    // INR per gram (24K)
  silver: 85,    // INR per gram
  platinum: 3200, // INR per gram
};

export async function GET(request: NextRequest) {
  try {
    // Using MetalAPI.com for live prices (Free tier available)
    const API_KEY = 'mk_live_x2UNnzHVnRF6aPbarnXopl02Fpux9b2T';
    
    // Fetch live metal prices from MetalAPI
    const response = await fetch(
      `https://api.metalapi.com/v1/latest?access_key=${API_KEY}&base=USD&symbols=XAU,XAG,XPT`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`MetalAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success === false) {
      throw new Error(`MetalAPI error: ${data.error?.info || 'Unknown error'}`);
    }

    // Convert USD per ounce to INR per gram
    const USD_TO_INR = 83; // Approximate exchange rate (you can fetch this from another API)
    const OUNCE_TO_GRAM = 31.1035;

    // Calculate INR per gram prices
    const goldPriceINR = Math.round((1 / data.rates.XAU) * USD_TO_INR / OUNCE_TO_GRAM);
    const silverPriceINR = Math.round((1 / data.rates.XAG) * USD_TO_INR / OUNCE_TO_GRAM);
    const platinumPriceINR = Math.round((1 / data.rates.XPT) * USD_TO_INR / OUNCE_TO_GRAM);

    const prices = {
      gold: goldPriceINR,
      silver: silverPriceINR,
      platinum: platinumPriceINR,
      timestamp: new Date().toISOString(),
      currency: 'INR',
      unit: 'per_gram',
      source: 'MetalAPI.com',
      exchange_rate_used: USD_TO_INR
    };

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error fetching live prices:', error);
    
    // Try alternative API - GoldAPI.io (Free tier available)
    try {
      const goldApiResponse = await fetch(
        'https://www.goldapi.io/api/XAU/INR',
        {
          headers: {
            'x-access-token': 'goldapi-a99t1nsmifjs94f-io',
            'Content-Type': 'application/json'
          },
          next: { revalidate: 300 }
        }
      );

      if (goldApiResponse.ok) {
        const goldData = await goldApiResponse.json();
        
        // Convert per ounce to per gram
        const goldPricePerGram = Math.round(goldData.price / 31.1035);
        
        return NextResponse.json({
          gold: goldPricePerGram,
          silver: Math.round(goldPricePerGram * 0.013), // Approximate silver ratio
          platinum: Math.round(goldPricePerGram * 0.49), // Approximate platinum ratio
          timestamp: new Date().toISOString(),
          currency: 'INR',
          unit: 'per_gram',
          source: 'GoldAPI.io (fallback)',
          note: 'Silver and Platinum prices are estimated based on gold ratio'
        });
      }
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError);
    }
    
    // Return fallback prices if all APIs fail
    return NextResponse.json({
      gold: FALLBACK_PRICES.gold,
      silver: FALLBACK_PRICES.silver,
      platinum: FALLBACK_PRICES.platinum,
      timestamp: new Date().toISOString(),
      currency: 'INR',
      unit: 'per_gram',
      source: 'Fallback prices',
      error: 'Live API unavailable, using fallback prices'
    });
  }
}
