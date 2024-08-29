import { Pinecone } from '@pinecone-database/pinecone';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const puppeteer = require('puppeteer');

// Grab site data and upload
export async function POST(req: NextRequest) {
  const body = await req.json();

  if(!("url" in body))
    return Response.json({}, {status: 404, statusText: "No Required Fields"})

  const suppliedURL = body.url

  // DB and AI init
  const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY});
  const openai = new OpenAI({apiKey: process.env.OPEN_AI_KEY});

  // Try Web Scraping then Uploading
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--start-maximized',
        `--disable-blink-features=AutomationControlled`,
        `--disable-web-security`,
        `--allow-running-insecure-content`
      ],
      defaultViewport: null
    });
    const page = await browser.newPage()

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36'
    );
    await page.goto(suppliedURL, {waitUntil: 'domcontentloaded'})
  
    // Get the entire body content
    const profData = await page.evaluate(() => {
      // Get Rating
      const ratingSelector = 'div[class^="RatingValue__Numerator-"]'
      const rating = document.querySelectorAll(ratingSelector)[0].textContent
      console.log(rating);
      
      // Get Prof Name
      const profNameSelector = 'div[class^=NameTitle__Name-]';
      const profName = document.querySelectorAll(profNameSelector)[0].textContent
      console.log(profName);
      
      // Get Reviews
      const reviewSelector = 'div[class^=Rating__RatingBody]'
      const reviews = document.querySelectorAll(reviewSelector)
      let reviewList:any = []
      reviews.forEach(review => reviewList.push(review.textContent))

      const tagSelector = 'span[class^=Tag-bs]';
      const tags = document.querySelectorAll(tagSelector);
      let tagString = ""
      let tagChecker = new Set()

      tags.forEach(tag => {
        if (!tagChecker.has(tag.textContent)) {
          tagString += tag.textContent + ', '

          tagChecker.add(tag.textContent)
        }
      })
      tagString = tagString.slice(0, -1)
      
      return {
        name: profName,
        rating: rating,
        tags: tagString,
        reviews: reviewList
      }

    });
    // Close Scraper
    await browser.close();


    // Get Data object and upload to pinecone
    const response = await openai.embeddings.create({
      input: profData.tags,
      model: "text-embedding-3-small",
      encoding_format: "float"
    });

    const embedding = response.data[0].embedding

    const processedData = {
      values: embedding,
      id: profData.name,
      metadata: profData
    }
    const index = pc.Index("rag")
    index.namespace("rateProfData").upsert([processedData])

    return Response.json({success:  true}, {status: 200});

  } catch (e) {
    console.log(e)
  }
  
  // Failed Run
  return Response.json({}, {status: 405, statusText: 'Error Scraping Data'});
  

}