import { Request, Response } from 'express';
import { ProductModel, IProduct } from '../models/Product';
import { ProductCategory } from '../models/ProductCategory';
import { getAllProducts } from '../services/VendorService';

// Website navigation help data
const navigationHelp = {
  routes: {
    '/': 'Home page - Main dashboard with overview',
    '/shop': 'Shop page - Browse and purchase furniture',
    '/products': 'Products page - Manage your products (Vendor only)',
    '/products/add':
      'Add Product - Create new furniture listings (Vendor only)',
    '/orders': 'Orders page - View and manage your orders',
    '/profile': 'Profile page - Manage your account settings',
  },
  features: {
    search: 'Use the search bar to find specific furniture items',
    filter: 'Filter products by category, price range, or availability',
    cart: 'Add items to cart and checkout securely',
    account: 'Manage your profile, addresses, and preferences',
  },
  categories: Object.values(ProductCategory),
  tips: [
    'Use specific keywords when asking for product recommendations',
    'Include your budget range for better suggestions',
    'Mention colors or styles you prefer',
    "Ask for help navigating if you're lost",
  ],
};

interface ChatRequest extends Request {
  body: {
    message: string;
    userId?: string;
    priceRange?: {
      min: number;
      max: number;
    };
    category?: ProductCategory;
    color?: string;
  };
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: ProductCategory;
  availableStock: number;
  vendor: {
    businessName: string;
  };
}

interface ProductRecommendation {
  product: ProductData;
  reason: string;
  matchScore: number;
}

interface ChatResponse {
  message: string;
  type: 'text' | 'product_recommendation' | 'navigation_help' | 'general';
  recommendations: ProductRecommendation[];
  navigationHelp: typeof navigationHelp | null;
}

export class AIController {
  /**
   * Main chat endpoint that handles user messages and provides AI responses
   */
  static async chat(req: ChatRequest, res: Response) {
    try {
      const { message, priceRange, category, color } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          error: 'Message is required',
        });
      }

      // Get all products from database first
      const allProducts = await getAllProducts();
      console.log('allProducts: ', allProducts);

      const lowerMessage = message.toLowerCase();
      let response: ChatResponse = {
        message: '',
        type: 'text',
        recommendations: [],
        navigationHelp: null,
      };

      // Check if user is asking for product recommendations using intelligent analysis
      if (AIController.isProductQuery(lowerMessage, allProducts)) {
        const recommendations =
          await AIController.getIntelligentRecommendations(
            message,
            allProducts,
            priceRange,
            category,
            color,
          );
        console.log('recommendations: ', recommendations);
        response = {
          message: AIController.generateRecommendationMessage(
            recommendations,
            message,
          ),
          type: 'product_recommendation',
          recommendations: recommendations,
          navigationHelp: null,
        };
      }
      // Check if user is asking for navigation help
      else if (AIController.isNavigationQuery(lowerMessage)) {
        response = {
          message: AIController.generateNavigationHelp(lowerMessage),
          type: 'navigation_help',
          recommendations: [],
          navigationHelp: navigationHelp,
        };
      }
      // General conversation
      else {
        response = {
          message: AIController.generateGeneralResponse(lowerMessage),
          type: 'general',
          recommendations: [],
          navigationHelp: null,
        };
      }

      res.json({
        success: true,
        response,
      });
    } catch (error) {
      console.error('AI Chat Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Sorry, I encountered an error. Please try again.',
      });
    }
  }

  /**
   * Intelligent product query detection based on actual product data
   */
  static isProductQuery(message: string, products: IProduct[]): boolean {
    // Extract all unique words from product names and descriptions
    const productTerms = new Set<string>();

    products.forEach((product) => {
      // Add words from product name
      product.name
        .toLowerCase()
        .split(/\s+/)
        .forEach((word) => {
          if (word.length > 2) productTerms.add(word);
        });

      // Add words from product description
      if (product.description) {
        product.description
          .toLowerCase()
          .split(/\s+/)
          .forEach((word) => {
            if (word.length > 2) productTerms.add(word);
          });
      }

      // Add category
      productTerms.add(product.category.toLowerCase());
    });

    // Check if any word in the message matches product terms
    const messageWords = message.toLowerCase().split(/\s+/);
    return (
      messageWords.some((word) => productTerms.has(word)) ||
      message.includes('price') ||
      message.includes('cost') ||
      message.includes('how much') ||
      message.includes('buy') ||
      message.includes('purchase') ||
      message.includes('find') ||
      message.includes('show me') ||
      message.includes('looking for') ||
      message.includes('recommend') ||
      message.includes('suggest')
    );
  }

  /**
   * Get intelligent product recommendations based on all available data
   */
  static async getIntelligentRecommendations(
    query: string,
    allProducts: IProduct[],
    priceRange?: { min: number; max: number },
    category?: ProductCategory,
    color?: string,
  ): Promise<ProductRecommendation[]> {
    try {
      let filteredProducts = [...allProducts];

      // Apply price filter
      if (priceRange) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.price >= priceRange.min && product.price <= priceRange.max,
        );
      }

      // Apply category filter
      if (category && Object.values(ProductCategory).includes(category)) {
        filteredProducts = filteredProducts.filter(
          (product) => product.category === category,
        );
      }

      // Apply color filter
      if (color) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(color.toLowerCase()) ||
            (product.description &&
              product.description.toLowerCase().includes(color.toLowerCase())),
        );
      }

      console.log(`Filtered to ${filteredProducts.length} products`);

      if (filteredProducts.length === 0) {
        return [];
      }

      // Score all filtered products based on query relevance
      const scoredProducts = filteredProducts.map((product) => {
        const score = AIController.calculateIntelligentScore(product, query);
        const reason = AIController.generateIntelligentReason(
          product,
          query,
          priceRange,
          color,
        );

        // Handle populated vendor field
        const vendor =
          typeof product.vendor === 'object' &&
          product.vendor !== null &&
          'businessName' in product.vendor
            ? {
                businessName: (product.vendor as { businessName: string })
                  .businessName,
              }
            : { businessName: 'Unknown Vendor' };

        return {
          product: {
            id: product._id.toString(),
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            description: product.description,
            category: product.category,
            availableStock: product.availableStock,
            vendor,
          },
          reason,
          matchScore: score,
        };
      });

      // Sort by relevance score and return top recommendations
      return scoredProducts
        .filter((rec) => rec.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting intelligent recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate intelligent relevance score based on actual product data
   */
  static calculateIntelligentScore(product: IProduct, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    const productName = product.name.toLowerCase();
    const productDesc = product.description?.toLowerCase() || '';
    const category = product.category.toLowerCase();

    // Split query into words
    const queryWords = lowerQuery
      .split(/\s+/)
      .filter((word) => word.length > 2);

    // Exact phrase match in name (highest priority)
    if (productName.includes(lowerQuery)) {
      score += 20;
    }

    // Exact phrase match in description
    if (productDesc.includes(lowerQuery)) {
      score += 15;
    }

    // Individual word matches with different weights
    queryWords.forEach((word) => {
      if (productName.includes(word)) {
        score += 8; // High weight for name matches
      }
      if (productDesc.includes(word)) {
        score += 5; // Medium weight for description matches
      }
      if (category.includes(word)) {
        score += 10; // High weight for category matches
      }
    });

    // Price inquiry bonus
    if (
      lowerQuery.includes('price') ||
      lowerQuery.includes('cost') ||
      lowerQuery.includes('how much')
    ) {
      score += 5;
    }

    // Stock availability bonus
    if (product.availableStock > 10) {
      score += 3;
    } else if (product.availableStock > 0) {
      score += 1;
    }

    // Vendor name match
    if (
      typeof product.vendor === 'object' &&
      product.vendor !== null &&
      'businessName' in product.vendor
    ) {
      const vendorName = (
        product.vendor as { businessName: string }
      ).businessName.toLowerCase();
      queryWords.forEach((word) => {
        if (vendorName.includes(word)) {
          score += 3;
        }
      });
    }

    return score;
  }

  /**
   * Generate intelligent recommendation reason based on actual matches
   */
  static generateIntelligentReason(
    product: IProduct,
    query: string,
    priceRange?: { min: number; max: number },
    color?: string,
  ): string {
    const reasons = [];
    const lowerQuery = query.toLowerCase();
    const productName = product.name.toLowerCase();
    const productDesc = product.description?.toLowerCase() || '';

    // Check what specifically matched
    if (productName.includes(lowerQuery)) {
      reasons.push('exact name match');
    } else if (productDesc.includes(lowerQuery)) {
      reasons.push('matches description');
    }

    // Category match
    if (lowerQuery.includes(product.category.toLowerCase())) {
      reasons.push(`perfect ${product.category.toLowerCase()} match`);
    }

    // Price range match
    if (
      priceRange &&
      product.price >= priceRange.min &&
      product.price <= priceRange.max
    ) {
      reasons.push(
        `within your budget ($${priceRange.min}-$${priceRange.max})`,
      );
    }

    // Color match
    if (
      color &&
      (productName.includes(color.toLowerCase()) ||
        productDesc.includes(color.toLowerCase()))
    ) {
      reasons.push(`available in ${color}`);
    }

    // Stock availability
    if (product.availableStock > 10) {
      reasons.push('excellent availability');
    } else if (product.availableStock > 5) {
      reasons.push('good availability');
    } else if (product.availableStock > 0) {
      reasons.push('limited stock available');
    }

    // Price inquiry specific
    if (
      lowerQuery.includes('price') ||
      lowerQuery.includes('cost') ||
      lowerQuery.includes('how much')
    ) {
      reasons.push(`clear pricing at $${product.price}`);
    }

    if (reasons.length === 0) {
      reasons.push('popular furniture choice');
    }

    return `Recommended because it has ${reasons.join(' and ')}.`;
  }

  /**
   * Check if user query is asking for navigation help
   */
  static isNavigationQuery(message: string): boolean {
    const navigationKeywords = [
      'how to',
      'where',
      'navigate',
      'find page',
      'go to',
      'help me navigate',
      'menu',
      'profile',
      'orders',
      'add product',
      'lost',
      'confused',
      'guide me',
      'show me around',
      'how do i',
      'where can i',
    ];

    return navigationKeywords.some((keyword) => message.includes(keyword));
  }

  /**
   * Generate navigation help response
   */
  static generateNavigationHelp(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Specific route help
    if (lowerMessage.includes('profile')) {
      return `To access your profile, click on the profile icon in the top navigation bar, then select 'My Account'. ${navigationHelp.routes['/profile']} You can update your personal information, addresses, and account settings there.`;
    }

    if (lowerMessage.includes('orders')) {
      return `To view your orders, go to the 'Orders' page from the main navigation. ${navigationHelp.routes['/orders']} You can track your current orders and view your order history there.`;
    }

    if (lowerMessage.includes('products') && lowerMessage.includes('add')) {
      return `To add new products (Vendor only), navigate to 'Products' → 'Add Product'. ${navigationHelp.routes['/products/add']} Fill in the product details, upload images, and set your pricing.`;
    }

    if (lowerMessage.includes('shop')) {
      return `To start shopping, click on the 'Shop' button in the navigation. ${navigationHelp.routes['/shop']} You can browse furniture by category, use filters, and add items to your cart.`;
    }

    if (lowerMessage.includes('home')) {
      return `The Home page is your main dashboard. ${navigationHelp.routes['/']} Access it by clicking the logo or 'Home' in the navigation.`;
    }

    // Feature-specific help
    if (lowerMessage.includes('search')) {
      return `${navigationHelp.features.search} You can find the search bar at the top of most pages, especially in the Shop section.`;
    }

    if (lowerMessage.includes('filter')) {
      return `${navigationHelp.features.filter} Look for filter options on the Shop page to narrow down your furniture choices.`;
    }

    if (lowerMessage.includes('cart')) {
      return `${navigationHelp.features.cart} Your cart icon is usually located in the top navigation bar.`;
    }

    // General navigation help with enhanced information
    return `I can help you navigate our website! Here are the main sections:

📍 **Main Routes:**
• Home - ${navigationHelp.routes['/']}
• Shop - ${navigationHelp.routes['/shop']}
• Products - ${navigationHelp.routes['/products']}
• Orders - ${navigationHelp.routes['/orders']}
• Profile - ${navigationHelp.routes['/profile']}

🎯 **Key Features:**
• Search - ${navigationHelp.features.search}
• Filters - ${navigationHelp.features.filter}
• Cart - ${navigationHelp.features.cart}
• Account - ${navigationHelp.features.account}

💡 **Pro Tips:**
${navigationHelp.tips.map((tip) => `• ${tip}`).join('\n')}

What specific page or feature would you like help with?`;
  }

  /**
   * Generate general conversational response
   */
  static generateGeneralResponse(message: string): string {
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello! I'm your furniture shopping assistant. I can help you find the perfect furniture based on your preferences, budget, and style. I can also guide you through our website. What can I help you with today?";
    }

    if (message.includes('help')) {
      return "I'm here to help! I can:\n• Recommend furniture based on your budget, color preferences, and style\n• Help you navigate our website\n• Answer questions about products and categories\n\nTry asking me something like 'Show me red sofas under $500' or 'How do I find my orders?'";
    }

    return "I'm your furniture shopping assistant! I can help you find products, navigate the website, and answer questions about furniture. What would you like to know?";
  }

  /**
   * Generate product recommendation message
   */
  static generateRecommendationMessage(
    recommendations: ProductRecommendation[],
    originalQuery: string,
  ): string {
    if (recommendations.length === 0) {
      return "I couldn't find any products matching your criteria. Try adjusting your price range or category, or browse our full catalog in the Shop section.";
    }

    const count = recommendations.length;
    const lowerQuery = originalQuery.toLowerCase();

    // Check if it's a price inquiry
    if (
      lowerQuery.includes('price') ||
      lowerQuery.includes('cost') ||
      lowerQuery.includes('how much')
    ) {
      if (count === 1) {
        const product = recommendations[0].product;
        return `Here's the pricing information for "${originalQuery}":\n\n**${product.name}** - $${product.price}\n${product.description || 'No description available'}\nAvailable stock: ${product.availableStock} units`;
      } else {
        return `I found ${count} products related to "${originalQuery}". Here are the prices and details:`;
      }
    }

    return `I found ${count} great ${count === 1 ? 'recommendation' : 'recommendations'} for "${originalQuery}". Here are the best matches based on your preferences:`;
  }
}

export default AIController;
