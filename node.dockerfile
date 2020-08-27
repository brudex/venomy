FROM node:12.18.3-alpine3.10
LABEL author="brudex:Penrose Akoto"

ENV NODE_ENV=production
ENV PORT=3000
COPY      nodeapp /var/www
WORKDIR   /var/www/
RUN       npm install

EXPOSE $PORT
ENTRYPOINT ["npm", "start"]