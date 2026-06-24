const Anthropic = require('@anthropic-ai/sdk');

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const generateEventContent = async (req, res, next) => {
  try {
    const { eventType, expectedGuests, dressCode, venue, date, field } = req.body;

    if (!client) {
      // Fallback: return template-based content when no API key
      const templates = {
        description: `A curated ${eventType || 'pop-up café'} experience for ${expectedGuests || 'up to 100'} guests at ${venue || 'a premium Cairo venue'}. Featuring specialty coffee, artisan pastries, and an unforgettable atmosphere. Dress code: ${dressCode || 'Smart Casual'}.`,
        agenda: `09:00 Venue Setup & Staff Briefing\n10:00 Doors Open — Guest Arrival & Check-In\n11:00 Welcome Address\n12:00 Main Event Begins\n14:00 Coffee Tasting & Special Presentation\n16:00 Entertainment / Live Music\n18:00 Evening Programme\n20:00 Closing Remarks\n21:00 Event Close`,
        budget: JSON.stringify({ Venue: Math.round(expectedGuests * 80), 'Coffee & Beverages': Math.round(expectedGuests * 55), 'Food & Pastries': Math.round(expectedGuests * 45), 'Decor & Flowers': Math.round(expectedGuests * 35), 'Staff': Math.round(expectedGuests * 25), 'Marketing': Math.round(expectedGuests * 15), 'Miscellaneous': Math.round(expectedGuests * 10) }),
      };
      return res.json({ result: templates[field] || templates.description, source: 'template' });
    }

    const prompts = {
      description: `Write a compelling 2-3 sentence event description for a ${eventType || 'pop-up café'} event with ${expectedGuests || 100} expected guests${venue ? ` at ${venue}` : ''}${date ? ` on ${date}` : ''}. Dress code: ${dressCode || 'Smart Casual'}. Make it sound professional and exciting for Cairo, Egypt. Return only the description, no extra text.`,

      agenda: `Create a detailed event-day agenda for a ${eventType || 'pop-up café'} event starting at 10 AM and ending at 10 PM with ${expectedGuests || 100} guests. Format each line as "HH:MM Activity Name". Include setup, opening, main activities, breaks, entertainment, and closing. Return only the agenda lines, no extra text.`,

      budget: `Suggest a budget breakdown in JSON format for a ${eventType || 'pop-up café'} event with ${expectedGuests || 100} guests in Cairo, Egypt. Return ONLY a JSON object with category names as keys and EGP amounts as integer values (e.g. {"Venue": 8000, "Coffee & Beverages": 5000}). No markdown, no explanation.`,
    };

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompts[field] || prompts.description }],
    });

    res.json({ result: message.content[0].text.trim(), source: 'ai' });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateEventContent };
