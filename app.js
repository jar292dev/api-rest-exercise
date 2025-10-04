const express = require('express') // require --> commonJS
const movies = require('./movies.json')
const crypto = require('node:crypto')
const cors = require('cors') // Middleware para habilitar CORS (Cross-Origin Resource Sharing)
const { validateMovie, validatePartialMovie } = require('./schemas/moviesSchema')

const PORT = process.env.PORT ?? 3000

// Lista de orígenes permitidos para CORS (en produccion, usar variables de entorno o una base de datos)
const ACCEPTED_ORIGINS = [
  'http://localhost:8080'
]

const app = express()
app.use(express.json()) // Habilitar req.body
app.use(cors()) // Habilitar CORS para todas las rutas y metodos {origin: *} (no recomendado en produccion)
/* app.use(cors({
  origin: ACCEPTED_ORIGINS // Permitir solo este origen
})) */
app.disable('x-powered-by') // Deshabilitar el header de x-powered-by: Express para no dar informacion a posibles atacantes, es innecesaria

app.get('/', (req, res) => {
  res.json({ message: 'Hola mundo' })
})

// Obtener todas
app.get('/movies', (req, res) => {
  // res.header('Access-Control-Allow-Origin', '*') // Permitir CORS para todos los dominios (no recomendado en produccion)
  // res.header('Access-Control-Allow-Origin', 'http://localhost:8080')

  /*   const origin = req.headers.origin // Obtener el origen de la peticion
  if (ACCEPTED_ORIGINS.includes(origin)) { // Verificar si el origen es permitido
    res.header('Access-Control-Allow-Origin', origin)
  } */
  const { genre } = req.query

  if (genre) {
    // const moviesByGenre = movies.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()))
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }

  res.json(movies)
})

// Obtener una
app.get('/movies/:id', (req, res) => { // path-to-regexp
  const { id } = req.params // Obtiene los parametros con el mismo nombre indicado en el path
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie not found' })
})

// Crear una
app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (!result.success) {
    // Opción 1: Errores más detallados con el formato original de Zod
    // return res.status(400).json({
    //   message: 'Validation failed',
    //   errors: result.error.issues.map(issue => ({
    //     field: issue.path.join('.'),
    //     message: issue.message,
    //     code: issue.code
    //   }))
    // })

    // Opción 2: Si prefieres el formato flatten (comenta la opción 1 y descomenta esta)
    return res.status(400).json({
      message: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors,
      formErrors: result.error.flatten().formErrors
    })
  }

  const newMovie = {
    id: crypto.randomUUID(), // Generar el UUID v4
    ...result.data
  }

  movies.push(newMovie) // Esto lo guarda en memoria

  res.status(201).json({ message: 'Movie created', movie: newMovie })
})

// Modificar parcialmente una pelicula
app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (!result.success) {
    return res.status(400).json({
      message: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors,
      formErrors: result.error.flatten().formErrors
    })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id) // findIndex devuelve -1 si no lo encuentra

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updatedMovie = { // Crear un nuevo objeto con los datos actualizados
    ...movies[movieIndex], // Datos actuales de la pelicula
    ...result.data // Datos a actualizar
  }

  movies[movieIndex] = updatedMovie // Reemplazar la pelicula en el array

  return res.json({ message: 'Movie updated', movie: updatedMovie })
})

// Borrar una pelicula
app.delete('/movies/:id', (req, res) => {
/*   const origin = req.headers.origin // Obtener el origen de la peticion
  if (ACCEPTED_ORIGINS.includes(origin)) { // Verificar si el origen es permitido
    res.header('Access-Control-Allow-Origin', origin)
  } */

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id) // findIndex devuelve -1 si no lo encuentra
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1) // Borrar la pelicula del array

  return res.json({ message: 'Movie deleted' })
})

/* app.options('/movies/:id', (req, res) => { // Manejar preflight request de CORS (OPTIONS)
  const origin = req.headers.origin // Obtener el origen de la peticion
  if (ACCEPTED_ORIGINS.includes(origin)) { // Verificar si el origen es permitido
    res.header('Access-Control-Allow-Origin', origin)
  }
  // res.header('Access-Control-Allow-Origin', '*') // Permitir CORS para todos los dominios (no recomendado en produccion)
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.send() // Responder con 200 OK y sin body
}) */

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`)
})
