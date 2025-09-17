import { Request, Response } from 'express';
import { ProductCategory } from '../models/ProductCategory';
import axios from 'axios';
import { ProductModel } from '../models/Product';
import { VendorModel } from '../models/Vendor';

// Website navigation help data
const navigationHelp = {
  routes: {
    '/': 'Home page - Main dashboard with overview',
    '/shop': 'Shop page - Browse and purchase furniture',
    '/orders': 'Orders page - View and manage your orders',
    '/profile': 'Profile page - Manage your account settings',
    '/products': 'Products page - Browse all available furniture',
    '/cart': 'Shopping cart - Review items before checkout',
    '/checkout': 'Checkout page - Complete your purchase',
  },
  features: {
    search:
      'Use the search bar to find specific furniture items by name or description',
    filter: 'Filter products by category, price range, or availability',
    cart: 'Add items to cart and checkout securely',
    account: 'Manage your profile, addresses, and preferences',
    wishlist: 'Save products for later purchase',
    reviews: 'Read customer reviews and ratings',
  },
  categories: Object.values(ProductCategory),
  priceFormat: 'VND (Vietnamese Dong)',
  tips: [
    'Use specific keywords when asking for product recommendations',
    'Include your budget range for better suggestions',
    'Mention colors, styles, or room types you prefer',
    'Ask about product availability and stock levels',
    'Inquire about sales and discounts on products',
    "Ask for help navigating if you're lost",
  ],
};

const FIREWORKS_CONFIG = {
  apiKey: process.env.FIREWORKS_API_KEY!,
  apiUrl: 'https://api.fireworks.ai/inference/v1/chat/completions',
  model: 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new',
  debug: process.env.DEBUG === 'true',
};

export class AIController {
  static async chat(req: Request, res: Response) {
    console.log('AI Chat endpoint hit:', {
      body: req.body,
      hasMessage: !!req.body?.message,
      hasApiKey: !!process.env.FIREWORKS_API_KEY,
    });
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.FIREWORKS_API_KEY) {
      console.error('FIREWORKS_API_KEY is not configured');
      return res.status(500).json({ error: 'AI service is not available' });
    }

    try {
      // Check if user is asking about specific product information or pricing
      const isProductQuery =
        /(?:how much|price|cost|expensive|cheap|available|stock|in stock)/i.test(
          message,
        );
      const isSearchQuery =
        /(?:do you have|find|search|show me|recommend)/i.test(message);

      let contextData = '';

      if (isProductQuery || isSearchQuery) {
        // Extract product name or keywords from the message
        const words = message.toLowerCase().split(' ');
        const productKeywords = words.filter(
          (word: string) =>
            word.length > 3 &&
            ![
              'how',
              'much',
              'price',
              'cost',
              'find',
              'show',
              'recommend',
              'available',
            ].includes(word),
        );

        if (productKeywords.length > 0) {
          // Search for products based on keywords
          const searchQuery = {
            $or: [
              { name: { $regex: new RegExp(productKeywords.join('|'), 'i') } },
              {
                description: {
                  $regex: new RegExp(productKeywords.join('|'), 'i'),
                },
              },
            ],
          };

          const products = await ProductModel.find(searchQuery).limit(5).exec();

          if (products.length > 0) {
            contextData = `\nRELEVANT PRODUCTS FOUND:\n${products
              .map((p) => {
                const productData = p.toObject();
                return `- ${productData.name}: ${productData.price.toLocaleString('vi-VN')} VND, ${productData.availableStock > 0 ? 'In Stock' : 'Out of Stock'}, Category: ${productData.category}${productData.sale > 0 ? `, Sale: ${productData.sale}% off` : ''}`;
              })
              .join('\n')}\n`;
          }
        }

        // Also get some general recommendations for categories mentioned
        for (const category of Object.values(ProductCategory)) {
          if (message.toLowerCase().includes(category.toLowerCase())) {
            const categoryProducts = await ProductModel.find({ category })
              .limit(3)
              .exec();

            if (categoryProducts.length > 0) {
              contextData += `\n${category} RECOMMENDATIONS:\n${categoryProducts
                .map((p) => {
                  const productData = p.toObject();
                  return `- ${productData.name}: ${productData.price.toLocaleString('vi-VN')} VND, ${productData.availableStock > 0 ? 'In Stock' : 'Out of Stock'}`;
                })
                .join('\n')}\n`;
            }
          }
        }
      }

      const systemPrompt = `You are a helpful AI assistant for a furniture e-commerce website called Fuzzy. Your role is to help customers find products, get pricing information, navigate the website, and provide recommendations.

WEBSITE INFORMATION:
- Currency: Vietnamese Dong (VND)
- Available Categories: ${Object.values(ProductCategory).join(', ')}
- Available Pages: ${Object.entries(navigationHelp.routes)
        .map(([route, desc]) => `${route} (${desc})`)
        .join(', ')}

RESPONSE GUIDELINES:
1. **Product Information**: When users ask about product prices, availability, or details, use the product information provided in the context.
2. **Pricing**: Always format prices in Vietnamese Dong (VND) format using commas for thousands.
3. **Recommendations**: Suggest products based on categories, budget, and user preferences.
4. **Navigation**: Help users find the right pages and features on the website.
5. **Stock Information**: Always mention if products are in stock or out of stock.
6. **Sales**: Highlight any sales or discounts when available.

Be friendly, helpful, and specific. If product information is provided in the context, use it to give accurate answers. If not, provide general guidance and suggest they browse specific categories or use the search function.

WEBSITE FEATURES:
${Object.entries(navigationHelp.features)
  .map(([feature, desc]) => `- ${feature}: ${desc}`)
  .join('\n')}

SHOPPING TIPS:
${navigationHelp.tips.map((tip) => `- ${tip}`).join('\n')}
${contextData}`;

      const requestBody = {
        model: FIREWORKS_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      };

      if (FIREWORKS_CONFIG.debug) {
        console.log(
          'Fireworks API Request:',
          JSON.stringify(requestBody, null, 2),
        );
      }

      const response = await axios.post(FIREWORKS_CONFIG.apiUrl, requestBody, {
        headers: {
          Authorization: `Bearer ${FIREWORKS_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (FIREWORKS_CONFIG.debug) {
        console.log(
          'Fireworks API Response:',
          JSON.stringify(response.data, null, 2),
        );
      }

      const reply = response.data.choices[0]?.message?.content;

      if (!reply) {
        throw new Error('No response content from Fireworks AI');
      }

      res.json({ reply: reply.trim() });
    } catch (error) {
      console.error('AI Controller Error:', error);
      res.status(500).json({
        error:
          'An error occurred while processing your request. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
}

export default AIController;
