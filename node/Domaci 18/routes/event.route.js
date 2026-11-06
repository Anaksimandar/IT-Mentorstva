const router = require("express").Router();
const eventController = require("../controllers/event.controller.js");

router.post("/", eventController.createEvent);
router.get("/", eventController.getAllEvents);
router.put("/:id", eventController.updateEvent);
router.delete("/:id", eventController.deleteEvent);

module.exports = router;
