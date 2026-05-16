# Portfolio Website

A simple portfolio website with Home, Portfolio, and Contact pages. The contact form saves data to CouchDB. Includes an AI chatbot using OpenAI API.

## Features
- Home page with introduction and images
- Portfolio page showcasing projects
- Contact page with form (name, email, message) saved to CouchDB
- JavaScript fetches and displays JSON data from CouchDB and a public API
- AI chatbot (OpenAI) answers questions about the owner/portfolio

## Setup
1. Install dependencies: `npm install`
2. Set up CouchDB and update credentials in `src/server.js`
3. Set your OpenAI API key in `.env`
4. Start the server: `npm start`
5. Open `http://localhost:3000` in your browser
