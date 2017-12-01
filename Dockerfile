FROM node:carbon
WORKDIR /usr/src/ayro
COPY . .
EXPOSE 3000
CMD ["npm", "start"]