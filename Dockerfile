FROM node:16

COPY . /opt/app

WORKDIR /opt/app

RUN npm install

CMD node index.js