#################################### start from clean
ARG NODE_VERSION=14-alpine

FROM node:${NODE_VERSION}


# STEP 1 ---- Install system dependencies
RUN \
  if [ "$TARGETPLATFORM" = 'linux/arm64' ]; then \
  apk --no-cache add \
  python3 \
  build-base \
  && ln -sf /usr/bin/python3 /usr/bin/python \
  ; fi

RUN \
  # Upgrade system and install 'ssmtp' to be able to send mails
  apk upgrade --no-cache && apk add --no-cache \
  ssmtp \
  # Add support for specifying the timezone of the container
  # using the "TZ" environment variable.
  tzdata \
  # Create directory for Directus with corresponding ownership
  # (can be omitted on newer Docker versions since WORKDIR below will do the same)
  && mkdir /strapi



# STEP 2 ---- Install node packages

# disable npm update warnings
RUN echo "update-notifier=false" >> ~/.npmrc

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies see http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/ for reference
COPY /package.json /tmp/package.json
RUN cd /tmp && npm install --only=production --no-package-lock
RUN cp -a /tmp/node_modules /strapi/





# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
COPY . /strapi

# STEP 4 ---- Switch User and set environment
WORKDIR /strapi


# Default environment variables
# (see https://docs.directus.io/reference/environment-variables/)
ENV \
  PORT="1338" \
  NODE_ENV="production"

RUN \
  # Create data directories
  mkdir -p \
    api \
    extensions \
    public/uploads


# STEP 5 ---- Mount

# Expose data directories as volumes
VOLUME \
  /strapi/.tmp \
  /strapi/public/uploads

# STEP 6 ---- Start strapi

EXPOSE 1338
CMD npm run start