This repository contains a templated codebase for a virtual venue. The goal of this project is to provide arts and educational organizations with a starting place for building their own web-based venues for live performances and virtual events.

This project was started to support a live performance incubated at [CultureHub](https://www.culturehub.org/) in Spring 2022.

# Getting Started

This guide assumes some familiarity with your the command line (a text-based interface for your computer) and with web-development technologies. So when you see blocks of code below, these should be entered into your MacOS Terminal 💻 or Windows/Linux equivalent.

```sh
# download this repository and change directory (cd) into the root folder
git clone https://github.com/AidanNelson/virtual-venue.git
cd virtual-venue

# install all dependencies on the front end
npm install

# install all dependencies for the websocket server
cd server
npm install
cd .. # go back to the root of the directory


# start the development servers
npm run dev

# You should now be able to access the venue from your web-browser at http://localhost:3000/

