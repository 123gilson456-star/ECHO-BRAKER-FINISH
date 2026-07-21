// Importamos Express y el enrutador
const express = require("express");
// Importamos los controladores
const {
  createAnalysis,
  listAnalyses,
  getAnalysis,
} = require("../controllers/analysisController");

// Creamos un router de Express
const router = express.Router();

// Definimos las rutas para /api/analyses
router.post("/", createAnalysis);  // POST para crear
router.get("/", listAnalyses);      // GET para listar
router.get("/:id", getAnalysis);    // GET para obtener uno por ID

// Exportamos el router para montarlo en app.js
module.exports = router;