###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

RUN npm run build
ENV NODE_ENV production
RUN npm ci --only=production && npm cache clean --force

USER node

###################
# PRODUCTION (BUILT ON CYPRESS)
###################

FROM cypress/included:13.7.1
ENV TZ="Europe/Berlin"

WORKDIR /app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules

COPY --chown=node:node --from=build /usr/src/app/dist/cypress ./cypress
COPY --chown=node:node --from=build /usr/src/app/dist/src .

# cypress.config.js und cypress.env.json must be placed in root dir
COPY --chown=node:node --from=build /usr/src/app/dist/cypress.* .

ENTRYPOINT [ "node", "main.js" ]