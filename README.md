
# Deploying Venomy to Docker 
Venomy my mnemonic for vue-express-node-mysql. After building several vuejs projects, I wanted a way to scaffold SPAs faster. I built this boilerplate for deployment of my apps to docker fast. This post will focus more on the deployment of the stack than on the actual application code. At the end of this post I will provide links to the github repository.

## Generating the node app
Lets do quick run of how the application code was generated : The application code is made up of the server app (nodeapp) which will be hosted on production and the client vuejs app. The server app was generated with yoeman express generator.
 The commands to get yoeman and generate the app as follows

    `npm install -g yo`
    `npm install -g generator-express`
    `yo nodeapp`

The client app was generated with using vue-cli. Commands to get vue-cli and generate the app :

     `npm install -g @vue/cli`
     `vue create client`

The client vue app will be making api calls to the nodeapp(server) over cors. You can client app by running

     `cd client`
     `npm run serve`
  which will lister on port 8080. With hot reloading any changes made to the client app reflects immediately.
To run the server app :

      `cd nodeapp`
      `npm start` listening on port 3000.
 
 So we have an expressjs backend and a vuejs frontend working together. Cool!! but we can't host the 2 apps separately so we have to merge them for production.

## Merging the apps for production
 To prepare the app for production we are going to merge the client app into the server backend. By default when you run
    `npm run build` 
in the client directory it publishes into a dist folder. We are going to configure the client to publish into the public directory of our server app. In vuejs you can create a `vue.config.js` file to handle this kind of configurations, you learn more about this here `https://cli.vuejs.org/config/#vue-config-js`. Create a vue.config.js file and paste the following code :

    `
    const path = require('path');
    module.exports = {
        outputDir: path.resolve(__dirname,'../nodeapp/public'),
        devServer:{
            proxy:{
                '/api':{
                    target: 'http://localhost:3000'
                }
            }
        }
    }
    `

The path configuration allows the client to call the server backend on a seprate port only on development machine. 

## Deploying the app with docker.
Now to the meat of matter. How do we dploy to a docker container. Lets create a docker file in the root of our application. Structure of project as follows:
    `venomy directory`
    `-nodeapp
        -app
        -config
        -public
        -app.js
        -package.json
     -client
        -public
        -src
        -package.json
     -node.dockerfile
     -docker-compose.yml
     `
 
 By default docker files should be name `Dockerfile` to be automatically loaded by docker compose but we are ninjas we can choose any name and specify that in the compose file so lets call the compose file `node.dockerfile`. Our docker file will contain definitions for building the node app into a container. Lets go over our node.dockerfile explaining each line in a comment. Comments in docker file begin with #


    FROM node:12.18.3-alpine3.10   #using node version 12 from alpine image. Tip:alpine images and smaller in size recommended
    LABEL author="brudex:Penrose"  #Specifying the author. Yours truly
    ENV NODE_ENV=production        #Setting or node environment to production. To be read in the nodeapp
    ENV PORT=3000                  #Set the port environment variable to 3000. To be read in the nodeapp
    COPY      nodeapp /var/www     #Copying the contents of nodeapp our application to /var/www in the container
    WORKDIR   /var/www/            #Set our workding directory to /var/www, Context to run subsequent commands
    RUN       npm install          #Install npm modules
    EXPOSE $PORT                   #Expose port 3000 defined above
    ENTRYPOINT ["npm", "start"]    # Run the app

    `

Next up we create our docker-compose file. Our docker compose file will contain definitions for building our node service, adding a mysql database and a phpmyadmin server for administering our mysql database. I know phpmyadmin is old school but it works with mysql better than any web database administrator. 


    version: '3.3'
    services:
    node:
        container_name: nodeapp
        build:
            context: .
            dockerfile: node.dockerfile
        ports:
          - "3000:3000"
        networks:
          - nodeapp-network
        depends_on:
          - mysql
    mysql:
        image: mysql/mysql-server:5.7
        container_name: mysql
        networks:
          - nodeapp-network
        environment:
            MYSQL_DATABASE: nodeapp
            MYSQL_USER: admin
            MYSQL_PASSWORD: pass
            MYSQL_ROOT_PASSWORD: my@secret-root
    phpmyadmin:
        image: phpmyadmin/phpmyadmin
        container_name: pma
        links:
          - mysql
        external_links:
          - db_server:mysql
        ports:
          - "8183:80"
        networks:
          - nodeapp-network
        environment:
            PMA_HOST: mysql
            PMA_HOSTS: mysql
            PMA_PORT: 3306
            PMA_ARBITRARY: 1
    networks:
      nodeapp-network:
        driver: bridge


We are using version 3.3 of docker compose, every compose file must choose from a range of versions `1.0` to `3.8` more about that [here](https://docs.docker.com/compose/compose-file/compose-versioning/#compatibility-matrix). There are 3 services defined in our docker compose file : node (our node app), mysql (our database), phpmyadmin (web db admin). 
  ### node service
    The node service is built from the `node.dockerfile`. The container is given a name `nodeapp`. Port 3000 is exposed to be accessible from outside the container. All 3 services is joined to nodeapp-network using a bridge driver.

  ### mysql service
    The mysql servic is the database service. It is pulled from the official mysql service version 5.7 on docker hub.
      MYSQL_DATABASE: nodeapp # Creates and initial database when the container starts
      MYSQL_USER: admin       # Creates an initial user when the database starts
      MYSQL_PASSWORD: pass    # Creates a password for the admin user
      MYSQL_ROOT_PASSWORD: my@secret-root # Create a password for the root user

    `
  ### phpmyadmin service
    Phpmyadmin is used as the web admin service, built from the official phpmyadmin service on docker hub. It opens a login  page on launch. You can enter the followign values to login base on our mysql service configuration.
      `Server : mysql
      `Username : admin
      `Password : pass

We are now set to host our service in docker. This tutorial did not focus on installing and setting up docker but there many resources on the web that teach that. To lauch our service, on the command line in the venomy directory type :

    `docker-compose up`
  
The will build the service and lauch all containers simultaneosly. If you have issues with your node app conncecting to the mysql service. Stop the service with `control + c` and rerun `docker-compose up` again. This is an issue with docker starting all services at once so mysql does not finish initializing before the node app tries to connect. You can do a setTimeout to launch the node server after 30 seconds to subvert this.