FROM node:18-alpine
WORKDIR /front
COPY ./package*.json .
COPY . .
RUN npm install

CMD npm install && npm start