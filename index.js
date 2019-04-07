//add a required component
const express = require('express')
//create an express app
const app = express()
const bodyParser = require('body-parser')

const path = require('path')

const sqlite = require('sqlite')
const dbConnection = sqlite.open(path.resolve(__dirname, 'banco.sqlite'), {Promise})

const port = process.env.PORT || 3000

app.use('/admin', (req, res, next) => {
    if (req.hostname === 'localhost'){
        next()
    } else {
        res.send('Not Allowed')
    }
})

app.set('views', path.join(__dirname, 'views'))
//set a view engine
app.set('view engine', 'ejs')


//it will reroute (to folder public) in case the path does not exist.
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.urlencoded({extended: true}))

//set a route
app.get('/', async(request, response) => {
    const db = await dbConnection
    const categoriasDb = await db.all('SELECT * FROM categorias')
    const vagas = await db.all('SELECT * FROM vagas')
    const categorias = categoriasDb.map(cat => {
        return{
            ...cat,
            vagas: vagas.filter(vaga => vaga.categoria === cat.id)
        }
    })
    response.render('home', {
        categorias
    })
})

app.get('/vaga/:id', async(request, response) => {
    const db = await dbConnection
    const vaga = await db.get('SELECT * FROM vagas WHERE id = ' + request.params.id)
    response.render('vaga', {
        vaga
    })
})

app.get('/admin', (request, response) => {
    response.render('admin/home')
})

app.get('/admin/vagas', async(request, response) => {
    const db = await dbConnection
    const vagas = await db.all('SELECT * FROM vagas')
    response.render('admin/vagas', {vagas})
})

app.get('/admin/vagas/delete/:id', async(request, response) => {
    const db = await dbConnection
    await db.run('DELETE FROM vagas WHERE id = ' + request.params.id)
    response.redirect('/admin/vagas')
})

app.get('/admin/vagas/nova', async(request, response) => {
    const db = await dbConnection
    const categorias = await db.all('SELECT * FROM categorias')
    
    response.render('admin/nova-vaga', {categorias})
})

app.post('/admin/vagas/nova', async(request, response) => {
    const { titulo, descricao, categoria } = request.body
    const db = await dbConnection
    await db.run(`insert into vagas(categoria, titulo, descricao) values('${categoria}', '${titulo}', '${descricao}')`)

    response.redirect('/admin/vagas')
})

app.get('/admin/vagas/editar/:id', async(request, response) => {
    const db = await dbConnection
    const categorias = await db.all('SELECT * FROM categorias')
    const vaga = await db.get('SELECT * FROM vagas WHERE id = ' + request.params.id)
    response.render('admin/editar-vaga', {categorias, vaga})
})

app.post('/admin/vagas/editar/:id', async(request, response) => {
    const { titulo, descricao, categoria } = request.body
    const id = request.params.id
    const db = await dbConnection
    await db.run(`UPDATE vagas SET categoria = ${categoria}, titulo = '${titulo}', descricao = '${descricao}' WHERE id = ${id}`)

    response.redirect('/admin/vagas')
})



const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY , categoria TEXT)')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY , categoria INTEGER, titulo TEXT, descricao TEXT)')
    //const categoria = 'Marketing team'
    //await db.run(`insert into categorias(categoria) values('${categoria}')`)
    //const vaga = 'Social Media (Las Vegas)'
    //const descricao = 'Vaga para Social Media bem nice'
    //await db.run(`insert into vagas(categoria, titulo, descricao) values(2, '${vaga}', '${descricao}')`)

}

init()

//run the server
app.listen(port, (err) => {
    if(err){
        console.log("Não foi possível iniciar o servidor do Jobify")
    } else {
        console.log('Servidor do Jobify iniciado...')
    }
})