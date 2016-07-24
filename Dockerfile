FROM instructure/node-passenger:5.7

USER root

ENV APP_HOME /usr/src/app
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME

ADD package.json $APP_HOME
RUN npm install

ENV NODE_ENV production
ADD webpack.config.js $APP_HOME
ADD . $APP_HOME
RUN npm run pack:prod

USER docker
