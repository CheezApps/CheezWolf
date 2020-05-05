# base image
FROM node:12.16.3-alpine

# add bash
RUN apk add --no-cache bash

# create project folders
RUN mkdir /home/node/app
RUN mkdir /home/node/app/node_modules

# set user to node
RUN chown -R node:node /home/node/app

USER node

# set working directory
WORKDIR /home/node/app
