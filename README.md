# Bantr

  ![github license](https://img.shields.io/badge/license-MIT-blue.svg)
  
  The Live Demo is on Heroku, [here](https://bantr.herokuapp.com/).

  Our presentation slides are [here](https://docs.google.com/presentation/d/1NbvGBX7XsGRq_13v1C-1ugE4SBc4aPLofeX8D86xtco/edit?usp=sharing).

## Table of Contents
  
- [About The Project](#description)
  - [User Story](#userstory)
  - [Technologies Used](#technologiesused)
- [Installation](#installation)
  - [Usage](#usage)
- [Demo](#demo)
- [Tests](#tests)
- [License](#license)
- [Contributions](#contributions)
- [ContactUs](#questions)

## Description
  BANTR is a light-weight social media platform developed using Node, Express, MySQL,CSS and Handlebars. This app has great amount of data privacy and a robust model built around it. It has a login and sign-up static HTML pages which is authenticated using Passport. 

### User Story
  As a bored person at home, I want to stay connected with all my old friends so that I can cherish and walk down the memory lane.
  As a Small Business Owner, I want to publicize my business through a social media application so that I can cut down on huge Marketing Costs.

### Technologies Used
  Handlebars is used to update the pages which have dynamic data involved in them, The blocks which were used in multiple pages are created as partial handlebar files. All the pages are styled using CSS and BootStrap. 

  We use Gravatar as a way to host users' avatars, and provide options for different anonymous avatars if they choose to use a generic one. The hashing of emails to create the links are done by a npm package.

  The data is held in a MySQL database, which is configured with three tables: Buds, Buzz, and Users. Sequelize is used for interacting with the data, acting as an ORM between the app and database.

## Installation
  Sign into your GitHub profile, Fork and then Clone the repository to local machine. Setup a MySQL database named "bantr_db" and update your root password in the config.js file; the app will create its own tables on first run. The seed data is available in the "models/" folder.
  
  Navigate to your terminal and then type node server.js which should start the server on http://localhost:8080. You should also be able to view the live application by visiting the Heroku server link provided, or upload it to your own Heroku space.

### Usage
  This is a light weight social media application which was developed to explore the functionalities that can be incorporated by using different latest technologies like express, handlebars, node, MYSQL. This is used to stay connected with your friends who you have never met in the recent past. This application gives the user an opportunity to share his/her thoughts and at the same time take an opportunity to look at other friend's thoughts.

## Demo

  [Demo](https://bantr.herokuapp.com/)

## License
  Licensed under the MIT license.

## Contributions
  Any contributions to this project would make me and many people out there learn and create new things. This feature is what it makes the open source community an amazing place. Having to develop conversation threads would be the next goal in the development of this light weight social media application.

## Tests
  No tests were constructed, this is an area of opportunity for anyone interested in collaborating.This would be a part of the future development.

## Questions
  * Feel free to reach out to our team if you have any additional questions:
    * [Zii Engelhardt](https://github.com/ziieng/)
    * [Cameron Hickey](https://github.com/chickey49/)
    * [Amber Alex Lee](https://github.com/lee-amber-alex/)
    * [Anusha Raava](https://github.com/anurav18/)
  * Github repository for [Bantr](https://github.com/ziieng/Bantr)
  * Live application deployed on Heroku, [here](https://bantr.herokuapp.com/)
