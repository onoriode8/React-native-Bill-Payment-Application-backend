FROM node

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 7070

CMD ["node", "server.js"]