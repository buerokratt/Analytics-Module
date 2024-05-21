ARG nginx_version=nginx:1.25.4-alpine

FROM node:22.0.0-alpine AS image
WORKDIR /app
COPY ./package.json .

FROM image AS build
RUN npm install --legacy-peer-deps --mode=development --ignore-scripts
COPY . .
RUN ./node_modules/.bin/vite build --mode=development
VOLUME /app

FROM $nginx_version AS web
COPY ./nginx/http-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build ./app/build/assets /usr/share/nginx/html/analytics-module/analytics/assets
COPY --from=build ./app/build/index.html /usr/share/nginx/html/analytics-module
COPY --from=build ./app/build/favicon.ico /usr/share/nginx/html/analytics-module
EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
