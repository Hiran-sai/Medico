const VALID_TIMINGS = ['morning', 'afternoon', 'evening', 'night'];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const stripMarkdownFences = (text) => {
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
        cleaned = cleaned.replace(/\n?```$/, '');
    }
    return cleaned.trim();
};

const normalizeTimings = (timings) => {
    if (!Array.isArray(timings)) return [];

    return [...new Set(
        timings
            .map((timing) => String(timing).trim().toLowerCase())
            .filter((timing) => VALID_TIMINGS.includes(timing))
    )];
};

export const normalizeMedicines = (medicines) => {
    if (!Array.isArray(medicines)) return [];

    return medicines.map((medicine) => ({
        name: String(medicine?.name ?? '').trim(),
        dosage: String(medicine?.dosage ?? '').trim(),
        frequency: String(medicine?.frequency ?? '').trim(),
        timings: normalizeTimings(medicine?.timings),
        duration: String(medicine?.duration ?? '').trim(),
        instructions: String(medicine?.instructions ?? '').trim(),
    }));
};

const parseMedicinesFromText = (rawText) => {
    const normalizedText = String(rawText || '').replace(/\r/g, '');
    const segments = normalizedText
        .split(/(?:\n+|\s*[.;]\s*|\s+and\s+)/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (segments.length === 0) return [];

    return segments.map((segment) => {
        const match = segment.match(/^(.*?)(?:\s+([0-9]+(?:mg|mcg|ml|g|tablet|tablets|capsule|capsules|drop|drops)?)?)?(?:\s+(.+))?$/i);
        const name = match?.[1]?.trim() || segment;
        const dosage = match?.[2]?.trim() || '';
        const remainder = match?.[3]?.trim() || '';

        const frequencyMatch = remainder.match(/(once|twice|three|four|daily|day|hour|hours|weekly|week|month|months)/i);
        const frequency = frequencyMatch ? remainder : '';

        const durationMatch = remainder.match(/(for\s+\d+\s+(day|days|week|weeks|month|months))/i);
        const duration = durationMatch ? durationMatch[0].replace(/^for\s+/i, '') : '';

        return {
            name,
            dosage,
            frequency,
            timings: [],
            duration,
            instructions: remainder.replace(/(once|twice|three|four|daily|day|hour|hours|weekly|week|month|months)/gi, '').trim()
        };
    });
};

/**
 * Calls the Google Gemini API to structure the raw OCR text into a JSON array of medicines.
 * @param {string} rawText - The raw OCR text.
 * @returns {Promise<Array>} The parsed JSON array of medicines.
 */
export const extractScheduleWithGemini = async (rawText, retries = 3, delayMs = 3000) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set, falling back to local extraction for OCR text.');
        return normalizeMedicines(parseMedicinesFromText(rawText));
    }

    const safeText = String(rawText || '').slice(0, 6000);
    const prompt = `You are an expert medical assistant. Convert the following raw OCR text extracted from a doctor's prescription into a structured JSON array of medicines.
    
Each object in the JSON array must follow this exact schema:
{
  "name": "string (name of the medicine, e.g. Paracetamol, Amoxicillin)",
  "dosage": "string (dosage, e.g. 500mg, 1 tablet, 5ml - leave empty string if not found)",
  "frequency": "string (frequency, e.g. once daily, twice daily, three times a day, every 8 hours - leave empty string if not found)",
  "timings": ["morning", "afternoon", "evening", "night"] (an array containing any of these four slots when the medicine should be taken, inferred from terms like "1-0-1", "before breakfast", "at bedtime", "night", "morning", "twice daily" - leave empty array if not specified/inferred)",
  "duration": "string (duration, e.g. 5 days, 1 week, 1 month - leave empty string if not found)",
  "instructions": "string (special instructions, e.g. before food, after food, with water - leave empty string if not found)"
}

Rules:
1. Leave fields as empty strings (or empty array for timings) rather than guess when the OCR text is unclear.
2. Return ONLY a valid JSON array of medicine objects.
3. Do NOT wrap the JSON in markdown code blocks (e.g. do NOT use \`\`\`json ... \`\`\`).
4. Do NOT output any conversational text, explanations, or markdown formatting outside the JSON array.

Raw OCR Text:
"""
${safeText}
"""`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: prompt }
                            ]
                        }
                    ],
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                const quotaLikeError = /quota|rate limit|too many requests|resource exhausted/i.test(errorText);

                if ((quotaLikeError || response.status === 429) && attempt < retries) {
                    console.warn(`Gemini quota exhausted. Attempt ${attempt} failed. Retrying in ${delayMs / 1000}s...`);
                    await delay(delayMs);
                    delayMs *= 2;
                    continue;
                }

                if (quotaLikeError || response.status === 429) {
                    console.warn('Gemini quota exhausted after retries, falling back to local extraction for OCR text.');
                    return normalizeMedicines(parseMedicinesFromText(rawText));
                }

                throw new Error(`Gemini API HTTP Error: ${response.statusText} (${response.status}). Details: ${errorText}`);
            }

            const result = await response.json();
            let textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textResponse) {
                throw new Error("Received empty content response from Gemini API");
            }

            textResponse = stripMarkdownFences(textResponse);

            try {
                const parsed = JSON.parse(textResponse);
                let medicines = [];

                if (Array.isArray(parsed)) {
                    medicines = parsed;
                } else if (parsed && typeof parsed === 'object') {
                    if (Array.isArray(parsed.medicines)) {
                        medicines = parsed.medicines;
                    } else {
                        medicines = [parsed];
                    }
                }

                return normalizeMedicines(medicines);
            } catch (parseError) {
                console.error("Failed to parse Gemini response as JSON:", textResponse);
                throw new Error("Gemini API response did not contain valid JSON: " + parseError.message);
            }
        } catch (error) {
            if (attempt < retries) {
                console.warn(`Gemini request failed. Attempt ${attempt} failed. Retrying in ${delayMs / 1000}s...`);
                await delay(delayMs);
                delayMs *= 2;
                continue;
            }

            throw error;
        }
    }
};
