# Clarity - Video Quality Tracking App

## Overview
Clarity is a React Native app that gamifies video consumption by tracking content quality and awarding XP based on educational value. Built with Expo and designed to encourage mindful media consumption.

## Inspiration
People often spend their time scrolling or watching videos. Unfortunately, they spend their time watching low-quality or brainrot videos. Because of that, this app is built to stop those bad habits.s

## What it does
Clarity is an XP-based progressive system; there are 5 levels in this app. The more XP you get, the higher your level is. Every video will be given 1-4 XP based on the video quality. This means that if you have a higher level, you have more knowledge from watching educational videos. Every day, Clarity will remove 2 videos, so it will not be easy to reach level 5

## How we built it
We built this app using React Native, Expo, TypeScript, and Supabase. To get the YouTube video properties, we use web scraping to get all the video properties like the description, title, thumbnail, duration, and views. After that, we use an advanced categorization like this.

- Educational Content: Tutorials, courses, academic content (+3 XP)
- Productivity Content: Tips, business advice, self-improvement (+2 XP)
- Brain Rot Content: reaction, meme, viral, cringe, clickbait (+1 XP)

We also use Figma to design the UI/UX and implement that design in the app.

## Challenges we ran into
We also have some challenges/problems we .avEveryery person in this project has a different time zone, which makes the app work less effectively. 

## Accomplishments that we're proud of
- **🎨 Modern UI/UX:** Clarity is supporting light and dark theme modes with the smoothest transitions. Providing a responsive design and great keyboard handling to make the users more comfortable using this app.
- **🔍 Enhanced Video Analysis:** This app uses an advanced video analysis that goes beyond URL parsing. Videos can be categorized by their channel, video length, keyword analysis, and with hashtag extraction. The more educational the video is, the more XP you can get.
- **👥 Social Features:** Clarity is combining the base app features with the social features that make the app more competitive.

## What we learned
With this app, we learned how to rate a video based on the video length, channel, views, and the video tag. Also, integrating Google Authentication to this app, so every user can interact with each other. Also,o we knew how to work together to make an app and implement the UI design into the app. 

## What's next for Clarity 
Our app doesn't end up here; there are still many features that need some improvement to make the app better. There are very much features possible to be added to this app, like:
- Better video recognition.
- More user interaction using the friends feature.
- More fun ways to earn XP

## Installation and Setup Instructions

Clone down this repository. You will need `node` and `npm` installed globally on your machine.  

Installation:

`npm install`  

To Run Test Suite:  

`npx expo start` 

To Visit App: Scan the QR from the console with the Expo Go App

