# base image
FROM node:12.16.3-alpine

# add bash
RUN apk add --no-cache bash

# create project folders
RUN mkdir /home/node/api
RUN mkdir /home/node/api/node_modules

# set user to node
RUN chown -R node:node /home/node/api

USER node

# set working directory
WORKDIR /home/node/api
