const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    required_error: 'Title is required',
    invalid_type_error: 'Title must be a string'
  }).min(1, { message: 'Title cannot be empty' }),

  director: z.string({
    required_error: 'Director is required',
    invalid_type_error: 'Director must be a string'
  }).min(1, { message: 'Director cannot be empty' }),

  year: z.number({
    required_error: 'Year is required',
    invalid_type_error: 'Year must be a number'
  }).min(1900, { message: 'Year must be after 1900' })
    .max(2050, { message: 'Year must be before 2050' })
    .int({ message: 'Year must be an integer' }),

  rate: z.number({
    invalid_type_error: 'Rate must be a number'
  }).min(0, { message: 'Rate must be at least 0' })
    .max(10, { message: 'Rate must be at most 10' })
    .optional(),

  poster: z.string({
    invalid_type_error: 'Poster must be a string'
  }).url({ message: 'Poster must be a valid URL' })
    .endsWith('.jpg', { message: 'Poster must be a jpg image' })
    .optional(),

  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'], {
      required_error: 'Genre is required',
      invalid_type_error: 'Genre must be one of: Action, Adventure, Comedy, Drama, Fantasy, Horror, Romance, Sci-Fi, Thriller'
    })
  ).min(1, { message: 'At least one genre is required' }),

  duration: z.number({
    invalid_type_error: 'Duration must be a number'
  }).positive({ message: 'Duration must be positive' })
    .int({ message: 'Duration must be an integer' })
    .optional()
})

function validateMovie (movie) {
  return movieSchema.safeParse(movie) // safeParse devuelve un objeto con { success: boolean, data: T } o { success: boolean, error: ZodError
}

function validatePartialMovie (movie) {
  return movieSchema.partial().safeParse(movie) // .partial() hace que todos los campos sean opcionales
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
