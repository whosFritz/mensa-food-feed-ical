# Mensa Food Feed iCal

This project provides an ICS feed for various Mensa locations, fetching meal data periodically and storing it in a MongoDB database. The data is served as ICS files via an Express.js API.

The meal data is provided by the [MensaHub API](https://github.com/olech2412/MensaHub/tree/master/MensaHub-Gateway), which is a free and open API for meal data for Leipzig's student cafeterias in Germany.

## Supported Platforms

- Calendar MacOS, iOS and IPad OS:
  - if u add the calendar to iCloud, it will be synced
    
## Features

- Fetches meal data for multiple Mensa locations.
- Stores meal data in a MongoDB database.
- Replaces old meals with updated data to avoid duplications.
- Provides an ICS feed for each Mensa.
- Logs activity and errors using Winston.
- Uses a cron job to update meal data every 10 minutes.
- Dockerized for easy deployment.

## Requirements

- Docker
- Docker Compose
- Node.js
- MongoDB

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/whosFritz/mensa-food-feed-ical.git
   cd mensa-food-feed-ical
    ```

2. Set up environment variables:

    Create a .env file in the root directory and add the following variables:
    ```env
    NODE_PORT_INTERN=24ereqew
    NODE_PORT_EXTERN=13123313123
    MONGODB_PORT=213123123132
    DB_URI=mongodb://mongodb-food:213123123132/databasename
    ````

3. Build and start the Docker containers:

    ```bash
    docker-compose up --build
    ```

4. Contributing

- Fork the repository
- Create a feature branch (git checkout -b feature-branch)
- Commit your changes (git commit -am 'Add new feature')
- Push to the branch (git push origin feature-branch)
- Create a new Pull Request
