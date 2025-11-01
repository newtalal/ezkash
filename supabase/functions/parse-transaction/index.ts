import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { transactionText } = await req.json();
    console.log("Parsing transaction text:", transactionText);

    const MAX_TRANSACTION_TEXT_LENGTH = 2000;

    if (!transactionText || typeof transactionText !== 'string') {
      return new Response(
        JSON.stringify({ error: "Transaction text is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (transactionText.length > MAX_TRANSACTION_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ 
          error: `Transaction text is too long. Maximum ${MAX_TRANSACTION_TEXT_LENGTH} characters allowed.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (transactionText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Transaction text cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a transaction parser for a finance app called EzKash. Your job is to extract transaction details from bank transaction text.

Extract:
1. amount: The transaction amount in KWD (as a number, without currency symbol)
2. description: A clean, concise description of the transaction
3. category: Predict the most appropriate category from this list:
   - Food & Dining
   - Transportation
   - Shopping
   - Entertainment
   - Bills & Utilities
   - Healthcare
   - Education
   - Travel
   - Personal Care
   - Home
   - Other

Return only the structured data, no explanations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Parse this transaction: ${transactionText}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "parse_transaction",
              description: "Extract transaction details from bank text",
              parameters: {
                type: "object",
                properties: {
                  amount: {
                    type: "number",
                    description: "Transaction amount as a number"
                  },
                  description: {
                    type: "string",
                    description: "Clean transaction description"
                  },
                  category: {
                    type: "string",
                    enum: [
                      "Food & Dining",
                      "Transportation",
                      "Shopping",
                      "Entertainment",
                      "Bills & Utilities",
                      "Healthcare",
                      "Education",
                      "Travel",
                      "Personal Care",
                      "Home",
                      "Other"
                    ],
                    description: "Predicted category"
                  }
                },
                required: ["amount", "description", "category"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "parse_transaction" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to parse transaction" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    console.log("AI Response:", JSON.stringify(aiResponse));

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response");
      return new Response(
        JSON.stringify({ error: "Failed to extract transaction details" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsedData = JSON.parse(toolCall.function.arguments);
    console.log("Parsed transaction data:", parsedData);

    return new Response(
      JSON.stringify(parsedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in parse-transaction function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
