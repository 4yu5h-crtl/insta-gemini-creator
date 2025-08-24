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
    Analyze this image in detail and generate a compelling Instagram post with:
    1. A catchy title (max 60 characters)
    2. An engaging caption (2-3 sentences, conversational tone)
    3. 5-8 relevant hashtags (popular and niche mix)
    
    Consider the image's mood, setting, colors, subjects, and potential story. Make the content engaging and Instagram-ready.
    
    Return the response in this exact JSON format:
    {
      "title": "Your catchy title here",
      "caption": "Your engaging caption here",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
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