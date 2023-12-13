**Real-Time Streaming Venue**

This venue supports real-time streaming for interactive events and live performance in a web browser. Arts and educational organizations can use this as a starting place for building their own web-based venues for real-time live performances and virtual events.

This project is supported and used by NYU's [Interactive Telecommunications Program](https://itp.nyu.edu) and [CultureHub](https://www.culturehub.org/).  Since 2022, it has been used for productions including [Take 21 (2022)](https://www.culturehub.org/take-21), [A Few Deep Breaths (2022)](https://www.culturehub.org/events/a-few-deep-breaths), [Fractals of Prometheus (2023)](https://www.culturehub.org/fractals-of-prometheus) and [Downtown Variety Ukraine Edition (2023)](https://www.culturehub.org/watch?mc_cid=fac8ca9ab2&mc_eid=55f6931a7e).


## Features

* **Real-Time Streaming** - This venue uses [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)-based (Web Real-Time Communication) video, audio and data streaming, which means that performers and audience members can interact with one another with significantly less than one second of latency  (much like a video call). By comparison, other forms of live streaming typically add 5-15 seconds of latency.  This lower latency allows for many paradigms of audience interaction (question and answer, call and response, stand-up comedy, etc.) which simply do not work with higher latencies.

* **Custom Interactions** - This venue has a web-based javascript editor, which allows creative technologist to add custom interactions which can be triggered during an event or performance.  Ask the audience to respond to a prompt, control projections with their mouse or join the stage with live video or otherwise affect the action of the show. 

* [Upcoming] **Integrations with Traditional Performance Systems** - Using OSC and the included electron app, it is possible to trigger changes in the venue using traditional live performance and theatrical software and systems including [QLab](https://qlab.app/), [TouchDesigner](https://derivative.ca/) and others.  This bi-directional integration also allows remote performers and audience members to trigger custom queues / interactions in your in-person venue.

## Getting Started

This guide assumes some familiarity with your the command line (a text-based interface for your computer) and with web-development technologies. So when you see blocks of code below, these should be entered into your MacOS Terminal 💻 or Windows/Linux equivalent.

```sh
# download this repository and change directory (cd) into the root folder
git clone https://github.com/AidanNelson/virtual-venue.git
cd virtual-venue

# install all dependencies for the nextjs server and front end
npm install

# copy the example environment file to a local .env file and update values as needed
cp example.env .env

# the backend uses mongodb for a database.  Create two files: db-cert.pem and db-key.pem and update with the certificate and key from your database
touch db-cert.pem
touch db-key.pem

# start the development server
npm run dev

# open a second terminal window for the realtime server
# install all dependencies for the websocket server
cd server
npm install

#start that server from the root of the project
cd ..
npm run start-server


# You should now be able to access the venue from your web-browser at http://localhost:3000/ 

```



