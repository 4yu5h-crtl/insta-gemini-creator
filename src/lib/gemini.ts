import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBhTq_RNJBtiSjx-N9v_FYZTc7xMvpjG2Y';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface InstagramPostData {
  title: string;
  caption: string;
  hashtags: string[];
}

export async function generateInstagramPost(
  imageFile: File
): Promise<InstagramPostData> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert image to base64
    const imageData = await fileToGenerativePart(imageFile);

    const prompt = `
    Analyze this handmade product image and create SEO-optimized, digitally marketized Instagram content for maximum reach and sales conversion:

    DIGITAL MARKETING FOCUS:
    - Use trending keywords and SEO-friendly terms
    - Include strategic call-to-actions (CTAs)
    - Apply psychological triggers (scarcity, social proof, FOMO)
    - Optimize for Instagram algorithm engagement
    - Target ideal customer personas
    - Include conversion-focused language

    CONTENT REQUIREMENTS:
    1. **TITLE** (45-60 chars): SEO-optimized product title with trending keywords
    2. **CAPTION** (3-4 sentences): Digital marketing optimized with:
       - Hook in first line to stop scrolling
       - Value proposition highlighting uniqueness
       - Emotional connection and storytelling
       - Strong CTA (DM, link in bio, save post, etc.)
       - Strategic keywords naturally integrated
    3. **HASHTAGS** (8-15 mix): Blend of:
       - High-volume trending hashtags (#handmade #etsy)
       - Niche-specific tags (#artisanmade #handcrafted)
       - Location-based if applicable
       - Branded/business hashtags
       - Product-specific keywords

    MARKETING PSYCHOLOGY:
    - Create urgency or exclusivity
    - Use social proof language
    - Target pain points and desires
    - Include sensory descriptions
    - Appeal to lifestyle aspirations

    Return in this exact JSON format:
    {
      "title": "SEO-optimized product title with keywords",
      "caption": "Digital marketing optimized caption with hooks, value props, emotion, and strong CTA",
      "hashtags": ["trending1", "niche2", "seo3", "conversion4", "lifestyle5", "artisan6", "handmade7", "business8"]
    }
    `;

    const result = await model.generateContent([prompt, imageData]);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating Instagram post:', error);
    throw new Error('Failed to generate Instagram post. Please try again.');
  }
}

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}