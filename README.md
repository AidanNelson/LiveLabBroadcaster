This repository contains a templated codebase for a virtual venue. The goal of this project is to provide arts and educational organizations with a starting place for building their own web-based venues for live performances and virtual events.

This project was started to support a live performance incubated at [CultureHub](https://www.culturehub.org/) in Spring 2022.

# Getting Started

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



