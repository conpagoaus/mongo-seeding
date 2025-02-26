# Run with context of the upper level directory

#
# Stage 1: Core
#

FROM node:18-alpine AS coreBuilder

ENV CORE_DIR=./core
WORKDIR /app

# Copy sources
COPY $CORE_DIR/package.json $CORE_DIR/package-lock.json $CORE_DIR/tsconfig.json /app/
COPY $CORE_DIR/src /app/src/

# Install dependencies
RUN npm install --no-optional

# Build app
RUN npm run build

# Remove sources
RUN rm -rf /app/src/ &&  \
    rm -rf /app/node_modules/
RUN npm i --production --no-optional

#
# Stage 2: CLI
#

FROM node:18-alpine as cliBuilder

ENV CLI_DIR=./cli
WORKDIR /app

# Install dependencies
COPY $CLI_DIR/package.json $CLI_DIR/package-lock.json $CLI_DIR/tsconfig.json /app/
RUN npm i --no-optional

# Copy built core 
COPY --from=coreBuilder /app/ node_modules/mongo-seeding/

# Copy app sources
COPY $CLI_DIR/src/ /app/src/
COPY $CLI_DIR/bin/ /app/bin/

# Build app
RUN npm run build

# Remove unnecessary sources
RUN rm -rf /app/src/ && \
    rm -rf /app/node_modules/

#
# Stage 3: Final Docker image
#

FROM node:18-alpine
LABEL org.opencontainers.image.title="Mongo Seeding" \
      org.opencontainers.image.description=" The ultimate solution for populating your MongoDB database. " \
      org.opencontainers.image.url="https://mongo-seeding.kosiec.dev" \
      org.opencontainers.image.documentation="https://mongo-seeding.kosiec.dev" \
      org.opencontainers.image.source="https://github.com/pkosiec/mongo-seeding.git" \
      org.opencontainers.image.version="dev" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY --from=cliBuilder /app/ /app/

# Create a symlink
RUN npm i --production --no-optional && \
    npm link && \
    rm -rf /app/node_modules/mongo-seeding/

# Copy built core 
COPY --from=coreBuilder /app/ /app/node_modules/mongo-seeding/

WORKDIR /data
CMD seed