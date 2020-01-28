FROM node:12-alpine

# prepare app directory
RUN mkdir -p /usr/src/app

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN rm -rf /usr/src/app/node_modules
RUN npm install --production

# staring service
WORKDIR /usr/src/app
CMD [ "npm", "run", "start" ]
