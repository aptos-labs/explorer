FROM node:18.16.0-bullseye-slim
WORKDIR /app
COPY . /app
RUN npm install
ENTRYPOINT ["npx", "playwright test"]