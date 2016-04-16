FROM instructure/node-passenger:5.7

USER root

ENV APP_HOME /usr/src/app
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME

ADD package.json $APP_HOME
RUN npm install
ADD webpack.config.js $APP_HOME
ADD app $APP_HOME/app
  RUN npm run pack

ADD . $APP_HOME
RUN chown -R docker:docker $APP_HOME

ENV NODE_ENV development
USER docker
