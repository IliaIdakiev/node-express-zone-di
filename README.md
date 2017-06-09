# NODEJS (Express) Framework using Angular ZoneJS and Dependency Injection.
## Under development !

This project was started as an example for my [Reflective Injection](https://github.com/IliaIdakiev/slides) talk. The idea is to use Angular core features and TypeScript inside NodeJS (with Express). [ZoneJS](https://github.com/angular/zone.js/) is used to forking a zone for each request and later that is used for authentication/authorization (and can be used for other things). The other main idea is to make the database models feel like we are working directly on the entities (All tasks like fetching data from db and saving it should stay hidden from the user. This is done using [ZoneJS](https://github.com/angular/zone.js/) hooks).

Dependency Injection is done via [injection-js](https://github.com/mgechev/injection-js)
### Contributors are welcome.
---
### TODO
* Choose a name for the project.
* Imporve API.
* Imporve ZoneJS inside Models.
* Use a real database inside the example.
* Create Cookie Authentication.
* Imporve request data extractors like `@body` to work with whole objects.
* Extract framework files to separate module.
* Imporve README.
* A bunch of other things

---

### Setup
`yarn` or `yarn install`

### Starting server
`yarn start`

Use [postman](https://www.getpostman.com/) to make API calls. <br/>
For authenticated requests set x-access-token property inside the header with this token: <br/><br/>
`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNDkyOTMxMzk5fQ.9oR56HgCeMFaLlGFMQ-SICDC8ZWaN31UvVDAJQnzLno` <br/><br/> as value.
