const { GoogleGenerativeAI } = require('@google/generative-ai');
const GreenProduct = require('../model/greenproduct');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Get coordinates for common origins (you can expand this)
const getOriginCoordinates = (origin) => {
  const originMap = {
    'USA': { lat: 40.7128, lng: -74.0060, name: 'New York, USA' },
    'China': { lat: 39.9042, lng: 116.4074, name: 'Beijing, China' },
    'Germany': { lat: 52.5200, lng: 13.4050, name: 'Berlin, Germany' },
    'Japan': { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' },
    'UK': { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
    'France': { lat: 48.8566, lng: 2.3522, name: 'Paris, France' },
    'Italy': { lat: 41.9028, lng: 12.4964, name: 'Rome, Italy' },
    'Canada': { lat: 45.4215, lng: -75.6972, name: 'Ottawa, Canada' },
    'Australia': { lat: -35.2809, lng: 149.1300, name: 'Canberra, Australia' },
    'Brazil': { lat: -15.7801, lng: -47.9292, name: 'Brasília, Brazil' }
  };
  
  return originMap[origin] || { lat: 40.7128, lng: -74.0060, name: origin || 'Unknown Origin' };
};

// Get user location coordinates (simplified - you can integrate with geocoding service)
const getUserLocationCoordinates = (userLocation) => {
  // Common Indian cities
  const cityMap = {
    'Delhi': { lat: 28.6139, lng: 77.2090 },
 
  };
  
  // Try to match user location with known cities
  for (const [city, coords] of Object.entries(cityMap)) {
    if (userLocation.toLowerCase().includes(city.toLowerCase())) {
      return { ...coords, name: city };
    }
  }
  
  // Default to Mumbai if no match
  return { lat: 19.0760, lng: 72.8777, name: userLocation || 'Unknown Location' };
};

// Calculate environmental impact metrics
const calculateEnvironmentalMetrics = (distanceSaved, carbonFootprint) => {
  // Fuel consumption: ~0.1 liters per km for trucks
  const fuelSaved = distanceSaved * 0.1;
  
  // CO2 from fuel: ~2.3 kg CO2 per liter of diesel
  const fuelCO2Saved = fuelSaved * 2.3;
  
  // Total CO2 saved (product + fuel)
  const totalCO2Saved = carbonFootprint + fuelCO2Saved;
  
  // Trees equivalent: 1 tree absorbs ~22 kg CO2 per year
  const treesEquivalent = totalCO2Saved / 22;
  
  // Monetary value: ~₹4000 per ton of CO2 saved (Indian market rate)
  const monetaryValue = (totalCO2Saved / 1000) * 4000;
  
  return {
    fuelSaved: fuelSaved.toFixed(1),
    fuelCO2Saved: fuelCO2Saved.toFixed(1),
    totalCO2Saved: totalCO2Saved.toFixed(1),
    treesEquivalent: treesEquivalent.toFixed(1),
    monetaryValue: monetaryValue.toFixed(0)
  };
};

// Get environmental impact analysis
exports.getEnvironmentalImpact = async (req, res) => {
  try {
    const { greenProductId, userLocation } = req.body;
    
    console.log('Environmental impact request:', { greenProductId, userLocation });
    
    if (!greenProductId || !userLocation) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if Gemini API key is set
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({ 
        message: 'Environmental impact service not configured',
        error: 'Gemini API key not found'
      });
    }

    // Get green product with populated product details
    const greenProduct = await GreenProduct.findById(greenProductId).populate('productId');
    
    if (!greenProduct) {
      console.log('Green product not found for ID:', greenProductId);
      return res.status(404).json({ message: 'Green product not found' });
    }

    console.log('Green product found:', {
      id: greenProduct._id,
      productName: greenProduct.productId?.name,
      origin: greenProduct.productId?.origin,
      carbonFootprint: greenProduct.carbonFootprint
    });

    // Extract data for environmental analysis
    const origin = greenProduct.productId.origin;
    const warehouseLocation = greenProduct.warehouseLocation;
    const productName = greenProduct.productId.name;
    const carbonFootprint = greenProduct.carbonFootprint;
    const greenCoins = greenProduct.greenCoins;

    // Get coordinates
    const originCoords = getOriginCoordinates(origin);
    const userCoords = getUserLocationCoordinates(userLocation);

    console.log('Coordinates:', {
      origin: originCoords,
      user: userCoords,
      warehouse: warehouseLocation
    });

    // Calculate distances
    const initialDistance = calculateDistance(
      originCoords.lat, 
      originCoords.lng,
      warehouseLocation.latitude, 
      warehouseLocation.longitude
    );

    const newDistance = calculateDistance(
      warehouseLocation.latitude,
      warehouseLocation.longitude,
      userCoords.lat,
      userCoords.lng
    );

    const distanceSaved = initialDistance - newDistance;
    const distanceImprovement = ((distanceSaved / initialDistance) * 100).toFixed(1);

    console.log('Distance calculations:', {
      initialDistance: initialDistance.toFixed(1),
      newDistance: newDistance.toFixed(1),
      distanceSaved: distanceSaved.toFixed(1),
      improvement: distanceImprovement
    });

    // Calculate environmental metrics
    const metrics = calculateEnvironmentalMetrics(distanceSaved, carbonFootprint);

    console.log('Environmental metrics:', metrics);

    // Create detailed prompt for Gemini
    const prompt = `
    Create a brief, customer-friendly "Green Rescue" message for a Walmart customer who just purchased a cancelled order.

    CONTEXT: A customer order was cancelled, so Walmart was going to ship the product back to its origin (${originCoords.name}) from our warehouse in Delhi. But this customer purchased it instead, so we saved that return journey.

    PRODUCT: ${productName}
    ORIGIN: ${originCoords.name}
    CUSTOMER LOCATION: ${userCoords.name}
    
    SAVINGS:
    - Distance saved: ${distanceSaved.toFixed(1)} km (return journey avoided)
    - Fuel saved: ${metrics.fuelSaved} liters
    - CO₂ saved: ${metrics.totalCO2Saved} kg
    - Trees equivalent: ${metrics.treesEquivalent} trees
    - Environmental value: ₹${metrics.monetaryValue}
    - Green coins earned: ${greenCoins}

    Create a brief, bullet-pointed response (max 80 words) that:
    1. Thanks the customer for their "Green Rescue" purchase
    2. Explains they prevented a return journey to ${originCoords.name}
    3. Lists key environmental benefits in bullet points
    4. Uses ₹ (rupees) for all monetary values
    5. Keeps it friendly and Walmart-branded

    Format as bullet points, be concise and customer-focused.
    `;

    console.log('Calling Gemini API with prompt length:', prompt.length);

    try {
      // Call Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const environmentalImpact = response.text();

      console.log('Gemini API response received, length:', environmentalImpact.length);

      res.status(200).json({
        success: true,
        environmentalImpact,
        data: {
          productName,
          origin: originCoords.name,
          userLocation: userCoords.name,
          warehouseLocation,
          carbonFootprint,
          greenCoins,
          distances: {
            initialDistance: initialDistance.toFixed(1),
            newDistance: newDistance.toFixed(1),
            distanceSaved: distanceSaved.toFixed(1),
            improvement: distanceImprovement
          },
          metrics: {
            fuelSaved: metrics.fuelSaved,
            totalCO2Saved: metrics.totalCO2Saved,
            treesEquivalent: metrics.treesEquivalent,
            monetaryValue: metrics.monetaryValue
          }
        }
      });
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      // Return a fallback response with calculated metrics
      res.status(200).json({
        success: true,
        environmentalImpact: `🎉 Thank you for your Green Rescue purchase!

• You prevented a ${distanceSaved.toFixed(1)} km return journey to ${originCoords.name}
• Saved ${metrics.fuelSaved}L fuel and ${metrics.totalCO2Saved} kg CO₂
• Equivalent to planting ${metrics.treesEquivalent} trees
• Environmental value: ₹${metrics.monetaryValue}
• Earned ${greenCoins} green coins

Thank you for helping Walmart reduce waste! ��`,
        data: {
          productName,
          origin: originCoords.name,
          userLocation: userCoords.name,
          warehouseLocation,
          carbonFootprint,
          greenCoins,
          distances: {
            initialDistance: initialDistance.toFixed(1),
            newDistance: newDistance.toFixed(1),
            distanceSaved: distanceSaved.toFixed(1),
            improvement: distanceImprovement
          },
          metrics: {
            fuelSaved: metrics.fuelSaved,
            totalCO2Saved: metrics.totalCO2Saved,
            treesEquivalent: metrics.treesEquivalent,
            monetaryValue: metrics.monetaryValue
          }
        }
      });
    }

  } catch (err) {
    console.error('Environmental impact error:', err);
    res.status(500).json({ 
      message: 'Error calculating environmental impact', 
      error: err.message 
    });
  }
}; 