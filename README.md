# Live Lab Broadcaster

LiveLab Broadcaster is a browser-based streaming platform used for real-time interaction with online audiences. This project is supported by NYU's [Interactive Telecommunications Program](https://itp.nyu.edu) and [CultureHub](https://www.culturehub.org/). Shows produced in the broadcaster include [Take 21 (2022)](https://www.culturehub.org/take-21), [A Few Deep Breaths (2022)](https://www.culturehub.org/events/a-few-deep-breaths), [Fractals of Prometheus (2023)](https://www.culturehub.org/fractals-of-prometheus), [Downtown Variety Ukraine Edition (2023)](https://www.culturehub.org/watch?mc_cid=fac8ca9ab2&mc_eid=55f6931a7e) and [Medea (2024)](https://www.culturehub.org/medea).

## Features

- **Real-Time Streaming** - This venue uses [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)-based (Web Real-Time Communication) video, audio and data streaming, which means that performers and audience members can interact with one another with significantly less than one second of latency (much like a video call). By comparison, other forms of live streaming typically add 5-15 seconds of latency. This lower latency allows for many paradigms of audience interaction (question and answer, call and response, stand-up comedy, etc.) which simply do not work with higher latencies.

- **Custom Interactions** - This venue has a web-based javascript editor, which allows creative technologist to add custom interactions which can be triggered during an event or performance. Ask the audience to respond to a prompt, control projections with their mouse or join the stage with live video or otherwise affect the action of the show.

- [Upcoming] **Integrations with Traditional Performance Systems** - Using OSC and the included electron app, it is possible to trigger changes in the venue using traditional live performance and theatrical software and systems including [QLab](https://qlab.app/), [TouchDesigner](https://derivative.ca/) and others. This bi-directional integration also allows remote performers and audience members to trigger custom queues / interactions in your in-person venue.

## Getting Started

This guide assumes some familiarity with your the command line (a text-based interface for your computer) and with web-development technologies. So when you see blocks of code below, these should be entered into your MacOS Terminal 💻 or Windows/Linux equivalent.


```sh
# Clone the repository to your local computer
git clone https://github.com/AidanNelson/LiveLabBroadcaster.git
cd LiveLabBroadcaster

# install node.js dependencies
npm install

# copy the example.env file into a new file called '.env'
cp example.env .env

# using a code editor, populate your environment variables as needed to 
# point at your realtime server and supabase backend

# start the next.js (front-end) development server
npm run dev

# You should now be able to access the broadcaster from your web-browser at http://localhost:3000/
```