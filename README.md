# ChargeNow
See DriveNow EVs in your area that needs charging. First react project.
This project is not meant for actual use by others. It's just a first-time-React demo of Redux, etc
I hacked together for personal use. Use at your own risk.

# Requirements for running
- Docker: https://docs.docker.com/mac/
- NPM: https://nodejs.org/en/download/

# Setup
1. Install packages: `npm install`
2. Make a build: `npm run build`
3. Run it! `docker-compose up`
4. Go to http://docker.dev:8080 or whatever address you entered in step 1

# Usage as iPhone web app
iOS treats webapps as second-class citizens. Task switching/quitting will refresh the webpage which would normally make it impossible to use.
But! With Redux and redux-storage it will persist state to localStorage and restore it, which actually works quite good. It requires a public web host and a bookmark to the root URL without the hash for it to work (the hash is added once the app is loaded, so you'll have to first create a version that doens't load react router), but once done, it works just fine.
