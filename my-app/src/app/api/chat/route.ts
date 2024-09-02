import { Pinecone } from "@pinecone-database/pinecone";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
// import { metadata } from '../../layout';

const systemPrompt = `
You are an AI assistant specializing in helping students find the best professors for their courses. Your knowledge is based on a comprehensive database of professor reviews and ratings. For each query, you will use RAG (Retrieval-Augmented Generation) to provide information on the most relevant professors.

Your responsibilities include:

1. Interpreting student queries about professors, courses, or teaching styles.
2. Presenting the information in a clear, concise, and helpful manner.
3. Providing additional context or explanations when necessary.
4. Answering follow-up questions about the professors or courses.

Remember to:
- Be objective and balanced in your presentations.
- Respect privacy by not sharing personal information about professors beyond what's publicly available in reviews.
- Encourage students to consider multiple factors when choosing a professor, not just ratings.
- Remind students that experiences can vary and to use the information as a guide, not an absolute truth.

If a query is unclear or too broad, ask for clarification or to submit a url of a Rate My Professor Link for the most accurate and helpful information.

Your goal is to help students make informed decisions about their course selections based on professor reviews and ratings.`;

export async function POST(req: NextRequest) {
  const body = await req.json();

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

  const index = pc.index("rag").namespace("rateProfData");

  const text = body.message[body.message.length - 1];
  console.log(text);

  // Read Data from database
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.text,
    encoding_format: "float",
  });

  const results = await index.query({
    topK: 3,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  let resultString = "";

  // Create Return String / embedding
  results.matches.forEach((item: any) => {
    console.log(item.metadata);
    //Subject: ${item.metadata.subject}
    resultString += `\n
    Professor: ${item.metadata.name}
    Stars: ${item.metadata.rating}
    Notable_Features: ${item.metadata.tags}
    Reviews: ${item.metadata.reviews}

    \n\n
    `;
  });

  const lastMessage = text.text;
  const lastMessageContent = lastMessage + resultString;

  // Perform Chat
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: lastMessageContent,
      },
    ],
    model: "gpt-4o-mini",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller: any) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
