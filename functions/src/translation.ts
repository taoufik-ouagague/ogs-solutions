import * as functions from 'firebase-functions';
import cors from 'cors';

const corsHandler = cors({ origin: true });

// Get DeepL API Key from environment - use a default for testing if not set
const DEEPL_API_KEY = process.env.DEEPL_API_KEY || 'f8e32d88-0be0-491a-aec2-297eaa7b8b41:fx';
const DEEPL_API_URL = 'https://api-free.deepl.com/v1/translate';

interface TranslateRequest {
  text: string;
  target_lang: string;
  source_lang?: string;
}

export const translateText = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(400).json({ error: 'Only POST requests are allowed' });
        return;
      }

      const { text, target_lang, source_lang } = req.body as TranslateRequest;

      if (!text || !target_lang) {
        res.status(400).json({ error: 'Missing required fields: text, target_lang' });
        return;
      }

      const params = new URLSearchParams({
        auth_key: DEEPL_API_KEY,
        text: text,
        target_lang: target_lang,
        ...(source_lang && { source_lang: source_lang }),
      });

      const response = await fetch(DEEPL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepL API error:', response.status, errorText);
        res.status(response.status).json({
          error: `DeepL API error: ${response.status}`,
          details: errorText,
        });
        return;
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({
        error: 'Translation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
});

export const translateBatch = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(400).json({ error: 'Only POST requests are allowed' });
        return;
      }

      const { texts, target_lang, source_lang } = req.body as {
        texts: string[];
        target_lang: string;
        source_lang?: string;
      };

      if (!Array.isArray(texts) || texts.length === 0 || !target_lang) {
        res.status(400).json({
          error: 'Missing required fields: texts (array), target_lang',
        });
        return;
      }

      const params = new URLSearchParams({
        auth_key: DEEPL_API_KEY,
        target_lang: target_lang,
        ...(source_lang && { source_lang: source_lang }),
      });

      texts.forEach((text) => {
        params.append('text', text);
      });

      const response = await fetch(DEEPL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepL API error:', response.status, errorText);
        res.status(response.status).json({
          error: `DeepL API error: ${response.status}`,
          details: errorText,
        });
        return;
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Batch translation error:', error);
      res.status(500).json({
        error: 'Batch translation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
});
