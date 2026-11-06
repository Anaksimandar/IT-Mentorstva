const eventService = require("../services/event.service");
const EventStatus = require("../generated/prisma/client").EventStatus;

module.exports = {
  createEvent: async (req, res, next) => {
    const { title, description, ticket_price, due_date, status } = req.body;
    if (!title || !description || !ticket_price || !due_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (status && !Object.values(EventStatus).includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${Object.values(EventStatus).join(", ")}`,
      });
    }
    try {
      const event = await eventService.createEvent(
        title,
        description,
        ticket_price,
        due_date,
        status,
      );
      res.status(201).json({ message: "Event created successfully", event });
    } catch (err) {
      console.error("Error creating event:", err);
      next(err);
    }
  },
  getAllEvents: async (req, res, next) => {
    try {
      const events = await eventService.getAllEvents();
      res.json({ message: "Events retrieved successfully", events });
    } catch (err) {
      next(err);
    }
  },
  updateEvent: async (req, res, next) => {
    const eventId = req.params.id;
    const eventData = req.body;

    if (
      !eventId ||
      !eventData.title ||
      !eventData.description ||
      !eventData.ticket_price ||
      !eventData.due_date
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (eventData.status && !Object.values(EventStatus).includes(eventData.status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${Object.values(EventStatus).join(", ")}`,
      });
    }
    try {
      const event = await eventService.updateEvent(eventId, eventData);
      res.json({ message: "Event updated successfully", event });
    } catch (err) {
      next(err);
    }
  },
  deleteEvent: async (req, res, next) => {
    const eventId = req.params.id;
    try {
      const event = await eventService.deleteEvent(eventId);
      res.json({ message: "Event deleted successfully", success: true });
    } catch (err) {
      next(err);
    }
  },
};
