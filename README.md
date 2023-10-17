# Analytics-Module

### Dev setup

 * Clone [Ruuter](https://github.com/buerokratt/Ruuter)
 * For Apple Silicon, replace Ruuter's Dockerfile line and add platform specification `FROM --platform=linux/amd64 openjdk:17-jdk-alpine`
 * Ruuter has an unresolved issue with allowing cross-origin credentials to be sent, for now fix this by adding:
  `.allowCredentials(true);` to line 24 in CORSConfiguration.java
 * Navigate to Ruuter and build the image `docker build -t ruuter .`
 * Clone [Resql](https://github.com/buerokratt/Resql)
 * Navigate to Resql and build the image `docker build -t resql .`
 * Clone [Data Mapper](https://github.com/buerokratt/DataMapper)
 * Navigate to Data Mapper and build the image `docker build -t datamapper-node .`
 * Running locally need to set ENV variable REACT_APP_LOCAL to true (default).
  
 * Navigate to current repo and run `docker compose up -d`

 * Go to https://localhost:3001
 
 ### Database setup
 * For setting up the database initially, run 
 `docker run --platform linux/amd64 --network=bykstack riaee/byk-users-db:liquibase20220615 --url=jdbc:postgresql://users_db:5432/byk --username=byk --password=01234 --changelog-file=./master.yml update`
 * Run migrations added in this repository by running the helper script `./migrate.sh`
 * When creating new migrations, use the helper `./create-migration.sh name-of-migration` which will create a timestamped file in the correct directory and add the required headers

Database configuration seed for developers:
Run the following command in your terminal when the users_db container is running, to add a default user and bot configuration
```
docker exec users_db psql byk byk -c "INSERT INTO public."user" (login,password_hash,first_name,last_name,id_code,display_name,status,created) VALUES
         ('EE90009999999','t','t','t','EE90009999999','t',NULL,NULL);
INSERT INTO public."configuration" ("key",value) VALUES
         ('bot_institution_id','botname');"
```


### Data Mapper Changes

* In Server.js add
```
app.post('/hbs/*', (req, res) => {
    res.render(req.params[0], req.body, function(_, response) {
        if (req.get('type') === 'csv') {
            res.json({response});
        } else if (req.get('type') === 'json') {
            res.json(JSON.parse(response));
        }
        res.render(req.params[0], req.body);
    });
});
```
to enable handlebars templates to receive a body and return a json
* When Building a handlebars template make sure to add `layout:false` so that hbs response in the data-mapper will discard the html layout and only return the body data

### Use external header component.

The external header component and its version is defined in the package.json file located inside GUI folder.
That line must be updated when header version or location changes.
```  
 "@exirain/header": "file:exirain-header-0.0.21.tgz"
```
Current solution uses the module from packed file. This means that when building docker image, a line to the docker script needs to be added for copying the file.
``` 
COPY ./exirain-header-0.0.21.tgz .
```
