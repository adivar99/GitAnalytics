# InspiraGen

The fashion industry has always been one of the most lucrative markets in terms of products and design. Every designer is always looking for new ways to come up with ideas and inspirations. Every new design and concept could be a new trend in fashion. In this project, we test the applications of various machine learning models to train and develop a vast array of fashion apparel, given an adequate dataset. Characteristics such as texture, shape, design and material are some of the parameters that we take into consideration while creating variations in the output. Features, specific to a designer, can be achieved by loading the previous works of the designer into the model. We will cover the various methodologies used to achieve the output and the best solution that we found. Such applications would find an interesting use case in designer boutiques such as H&M and ZARA as well as existing online boutiques such as SHEIN. 

### Dependencies:
 1. Docker
 2. Docker-compose

### To build
    NOTE: currently need to navigate to frontend/angular-app and run 'npm install' locally before running docker containers. Need to fix.
 1. `docker-compose -f baseimgs/docker-compose.yml build`
 2. `docker-compose build`

### To Bring up Application
 1. `docker-compose up`
 2. open `localhost` in your browser
