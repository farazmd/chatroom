FROM node:19.6.1

WORKDIR /usr/src/chatroom

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]