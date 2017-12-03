FROM node:carbon-alpine
WORKDIR /usr/src/ayro
COPY ./package*.json ./
RUN apk add --no-cache --virtual .build-deps make gcc g++ python && \
  apk add --update --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing vips-dev fftw-dev && \
  npm install --production --silent && \
  npm rebuild bcrypt --build-from-source && \
  apk del .build-deps fftw-dev
COPY . .
EXPOSE 3000
CMD ["npm", "start"]