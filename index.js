//add a required component
const express = require('express')
//create an express app
const app = express()

//set a view engine
app.set('view engine', 'ejs')

//it will reroute (to folder public) in case the path does not exist.
app.use(express.static('public'))

//set a route
app.get('/', (request, response) => {
    response.render('home')
})

app.get('/vaga', (request, response) => {
    response.render('vaga')
})

//run the server
app.listen(3000, (err) => {
    if(err){
        console.log("Não foi possível iniciar o servidor do Jobify")
    } else {
        console.log('Servidor do Jobify iniciado...')
    }
})