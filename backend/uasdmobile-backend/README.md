# UASD Mobile Backend

This project is a backend application for the UASD Mobile platform, built using Node.js and Express. It provides RESTful APIs to manage academic subjects, study plans, and personnel.
zzz
## Project Structure

```
uasdmobile-backend
├── src
│   ├── routes
│   │   ├── asignaturas.js       # Routes for managing academic subjects
│   │   ├── planes.js            # Routes for managing study plans
│   │   └── personal.js          # Routes for managing personnel
│   ├── config
│   │   └── dbConfig.js          # Database configuration
│   ├── server.js                 # Entry point of the application
│   └── app.js                    # Initializes the Express application and sets up routes
├── package.json                  # npm configuration file
└── README.md                     # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd uasdmobile-backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```

2. The server will run on `http://localhost:4000`.

## API Endpoints

### Asignaturas
- `GET /asignaturas` - Retrieve all subjects
- `GET /asignaturas/:planId` - Retrieve subjects by study plan
- `POST /asignaturas` - Create a new subject
- `PUT /asignaturas/:id` - Update an existing subject
- `DELETE /asignaturas/:id` - Delete a subject

### Planes de Estudio
- `GET /planes` - Retrieve all study plans
- `POST /planes` - Create a new study plan
- `DELETE /planes/:id` - Delete a study plan

### Personal
- `GET /personal` - Retrieve all personnel
- `POST /personal` - Create a new personnel
- `PUT /personal/:id` - Update an existing personnel
- `DELETE /personal/:id` - Delete a personnel

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.