FROM node:18

WORKDIR /frontend

COPY package*.json ./

RUN npm install
#  --no-bin-links
# If you are building your code for production
# RUN npm ci --omit=dev

COPY . .

EXPOSE 5173

CMD npm run dev
