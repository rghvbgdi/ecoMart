const Product = require('../model/products');
const GreenProduct = require('../model/greenproduct');

// Get all products (no filter)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get only unsold products
exports.getUnsoldProducts = async (req, res) => {
  try {
    const products = await Product.find({ isSold: false, isGreenDeal: { $ne: true } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unsold products', error: error.message });
  }
};


exports.getSoldProducts = async (req, res) => {
  console.log('getSoldProducts endpoint HIT');
  try {
    console.log('Fetching sold products...');
    const soldProducts = await Product.find({ isSold: true });
    console.log('Sold products:', soldProducts.length);

    console.log('Fetching green products...');
    const greenProducts = await GreenProduct.find({}, 'productId');
    console.log('Green products:', greenProducts.length);

    const greenProductIds = new Set(
      greenProducts
        .filter(gp => gp.productId)
        .map(gp => gp.productId.toString())
    );
    const normalSoldProducts = soldProducts.filter(p => !greenProductIds.has(p._id.toString()));
    res.status(200).json(normalSoldProducts);
  } catch (error) {
    console.error('Error in getSoldProducts:', error);
    res.status(500).json({ message: 'Error fetching sold products', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};
