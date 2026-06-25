// Bootstrap the backend from the repo root (Playwright webServer helper).
// Changes cwd to backend/ so dotenv finds backend/.env correctly.
const path = require("path");
process.chdir(path.join(__dirname, "..", "backend"));
require("../backend/app.js");
