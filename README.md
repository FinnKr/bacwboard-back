# BACWBoard-back

This is the Backend of the Web-App BACWBoard
BACWBoard is a productivity tool to colloborate with multiple users in form of a interactive Kanban-Board.

It is possible to host this project as a standalone backend REST-Api.
You can also use the plain HTML5 frontend: [bacwboard-front](https://github.com/FinnKr/bacwboard-front)

Prequesitions:

* Install node and npm (https://nodejs.org/).
* Install [MySQL](https://dev.mysql.com/downloads/mysql/)- or [MariaDB](https://downloads.mariadb.org/)-Server (or use an existing one).
* Clone this repository (`git clone https://github.com/FinnKr/bacwboard-back`)
* Configure MySql/MariaDB-Server as in [db.config.js](./app/config/db.config.js) or edit [db.config.js](./app/config/db.config.js) according to your Server-Configuration
* Choose a strong secret key for jsonwebtoken-verification: `JWT_KEY` in [constants.js](./app/config/constants.js).
* Install needed npm packages with `npm install` in the project directory

To start the project: `node server.js`