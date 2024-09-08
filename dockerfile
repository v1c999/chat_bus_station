# Stage 1: Build the Vue.js frontend
FROM node:lts AS build

WORKDIR /app

COPY package*.json ./

RUN rm -rf node_modules package-lock.json

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Prepare the production environment
FROM node:lts

WORKDIR /app

# Copy the built files from the previous stage
COPY --from=build /app/dist /app/dist

# Copy the server.js and necessary JSON files to the production environment
COPY script.cjs /app/
COPY server.js /app/
COPY GetStop.json /app/
COPY GetEstimateTime.json /app/
COPY GetRoute.json /app/

# Install serve globally to serve the frontend
RUN npm install -g serve

# Install express for the backend
RUN npm install express
RUN npm install axios
# Expose ports for both frontend and backend
EXPOSE 5000
EXPOSE 3005

# Start both the backend server and the frontend server
CMD ["sh", "-c", "node server.js & serve -s dist -l 5000"]
