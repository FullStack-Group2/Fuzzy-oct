import { Request, Response } from 'express';
import { ProductModel, IProduct } from '../models/Product';
import { ProductCategory } from '../models/ProductCategory';

// Website navigation help data
const navigationHelp = {
  routes: {
    '/': 'Home page - Main dashboard with overview',
    '/shop': 'Shop page - Browse and purchase furniture',
    '/products': 'Products page - Manage your products (Vendor only)',
    '/products/add': 'Add Product - Create new furniture listings (Vendor only)',
    '/orders': 'Orders page - View and manage your orders',
  },
  features: {
    search: 'Use the search bar to find specific furniture items',
    filter: 'Filter products by category, price range, or availability',
    cart: 'Add items to cart and checkout securely',
    account: 'Manage your profile, addresses, and preferences'
  },
  categories: Object.values(ProductCategory)
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
          error: 'Message is required'
        });
      }

      const lowerMessage = message.toLowerCase();
      let response: ChatResponse = {
        message: '',
        type: 'text',
        recommendations: [],
        navigationHelp: null
      };

      // Check if user is asking for product recommendations
      if (AIController.isProductRecommendationQuery(lowerMessage)) {
        const recommendations = await AIController.getProductRecommendations(message, priceRange, category, color);
        response = {
          message: AIController.generateRecommendationMessage(recommendations, message),
          type: 'product_recommendation',
          recommendations: recommendations,
          navigationHelp: null
        };
      }
      // Check if user is asking for navigation help
      else if (AIController.isNavigationQuery(lowerMessage)) {
        response = {
          message: AIController.generateNavigationHelp(lowerMessage),
          type: 'navigation_help',
          recommendations: [],
          navigationHelp: navigationHelp
        };
      }
      // General conversation
      else {
        response = {
          message: AIController.generateGeneralResponse(lowerMessage),
          type: 'general',
          recommendations: [],
          navigationHelp: null
        };
      }

      res.json({
        success: true,
        response
      });

    } catch (error) {
      console.error('AI Chat Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Sorry, I encountered an error. Please try again.'
      });
    }
  }

  /**
   * Get product recommendations based on user query and filters
   */
  static async getProductRecommendations(
    query: string, 
    priceRange?: { min: number; max: number }, 
    category?: ProductCategory,
    color?: string
  ): Promise<ProductRecommendation[]> {
    
    try {
      // Build MongoDB query
      const mongoQuery: Record<string, unknown> = { availableStock: { $gt: 0 } };
      
      // Add price filter
      if (priceRange) {
        mongoQuery.price = {
          $gte: priceRange.min,
          $lte: priceRange.max
        };
      }
      
      // Add category filter
      if (category && Object.values(ProductCategory).includes(category)) {
        mongoQuery.category = category;
      }

      // Get products from database
      const products = await ProductModel.find(mongoQuery)
        .populate('vendor', 'businessName')
        .limit(10);

      if (products.length === 0) {
        return [];
      }

      // Score and rank products based on query relevance
      const recommendations: ProductRecommendation[] = products.map(product => {
        const score = AIController.calculateRelevanceScore(product, query, color);
        const reason = AIController.generateRecommendationReason(product, query, priceRange, color);
        
        // Handle populated vendor field
        const vendor = typeof product.vendor === 'object' && product.vendor !== null && 'businessName' in product.vendor
          ? { businessName: (product.vendor as { businessName: string }).businessName }
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
            vendor
          },
          reason,
          matchScore: score
        };
      });

      // Sort by relevance score and return top recommendations
      return recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

    } catch (error) {
      console.error('Error getting product recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score for a product based on user query
   */
  static calculateRelevanceScore(product: IProduct, query: string, color?: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    const productName = product.name.toLowerCase();
    const productDesc = product.description?.toLowerCase() || '';

    // Name match (highest weight)
    if (productName.includes(lowerQuery)) score += 10;
    
    // Category match
    if (lowerQuery.includes(product.category.toLowerCase())) score += 8;
    
    // Description match
    const queryWords = lowerQuery.split(' ');
    queryWords.forEach(word => {
      if (productName.includes(word)) score += 3;
      if (productDesc.includes(word)) score += 2;
    });

    // Color match (if specified)
    if (color && productDesc.includes(color.toLowerCase())) score += 5;

    // Stock availability bonus
    if (product.availableStock > 10) score += 2;

    return score;
  }

  /**
   * Generate recommendation reason for a product
   */
  static generateRecommendationReason(
    product: IProduct, 
    query: string, 
    priceRange?: { min: number; max: number },
    color?: string
  ): string {
    const reasons = [];

    if (query.toLowerCase().includes(product.category.toLowerCase())) {
      reasons.push(`matches your search for ${product.category.toLowerCase()}`);
    }

    if (priceRange && product.price >= priceRange.min && product.price <= priceRange.max) {
      reasons.push(`fits your budget ($${priceRange.min}-$${priceRange.max})`);
    }

    if (color && product.description?.toLowerCase().includes(color.toLowerCase())) {
      reasons.push(`available in ${color} color`);
    }

    if (product.availableStock > 10) {
      reasons.push('good availability');
    }

    if (reasons.length === 0) {
      reasons.push('popular choice');
    }

    return `Recommended because it ${reasons.join(' and ')}.`;
  }

  /**
   * Check if user query is asking for product recommendations
   */
  static isProductRecommendationQuery(message: string): boolean {
    const recommendationKeywords = [
      'recommend', 'suggest', 'find', 'looking for', 'need', 'want to buy',
      'show me', 'furniture', 'sofa', 'chair', 'table', 'bed', 'cabinet',
      'cheap', 'expensive', 'budget', 'price', 'color', 'red', 'blue', 'white',
      'black', 'brown', 'grey', 'green', 'buy', 'purchase', 'shop'
    ];

    return recommendationKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if user query is asking for navigation help
   */
  static isNavigationQuery(message: string): boolean {
    const navigationKeywords = [
      'how to', 'where', 'navigate', 'find page', 'go to', 'help',
      'menu', 'profile', 'orders', 'products', 'shop', 'add product',
      'lost', 'confused', 'guide me', 'show me around'
    ];

    return navigationKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Generate navigation help response
   */
  static generateNavigationHelp(message: string): string {
    if (message.includes('profile')) {
      return "To access your profile, click on the profile icon in the top navigation bar, then select 'My Account'. There you can update your personal information, addresses, and account settings.";
    }
    
    if (message.includes('orders')) {
      return "To view your orders, go to the 'Orders' page from the main navigation. You can track your current orders and view your order history there.";
    }
    
    if (message.includes('products') && message.includes('add')) {
      return "To add new products (Vendor only), navigate to 'Products' → 'Add Product'. Fill in the product details, upload images, and set your pricing.";
    }
    
    if (message.includes('shop')) {
      return "To start shopping, click on the 'Shop' button in the navigation. You can browse furniture by category, use filters, and add items to your cart.";
    }

    return "I can help you navigate our website! Here are the main sections:\n• Home - Main dashboard\n• Shop - Browse furniture\n• Products - Manage your listings (Vendors)\n• Orders - Track your purchases\n• Profile - Account settings\n\nWhat specific page are you looking for?";
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
  static generateRecommendationMessage(recommendations: ProductRecommendation[], originalQuery: string): string {
    if (recommendations.length === 0) {
      return "I couldn't find any products matching your criteria. Try adjusting your price range or category, or browse our full catalog in the Shop section.";
    }

    const count = recommendations.length;
    return `I found ${count} great ${count === 1 ? 'recommendation' : 'recommendations'} for "${originalQuery}". Here are the best matches based on your preferences:`;
  }
}

export default AIController;