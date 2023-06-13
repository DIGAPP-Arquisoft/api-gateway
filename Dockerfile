FROM node:16

COPY . /opt/app

WORKDIR /opt/app

EXPOSE 4001

RUN npm install

CMD npm start