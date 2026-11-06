const prisma = require("../prismaClient");

async function createEvent(title, description, ticket_price, due_date, status) {
  console.log("Creating event with data:", { title, description, ticket_price, due_date, status });
  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        ticket_price,
        due_date,
        status,
      },
    });
    return event;
  } catch (err) {
    console.error("Error creating event:", err);
    throw new Error("Failed to create event");
  }
}
async function getAllEvents() {
  try {
    const events = await prisma.event.findMany();
    return events;
  } catch (err) {
    console.error("Error fetching events:", err);
    throw new Error("Failed to fetch events");
  }
}
async function updateEvent(eventId, eventData) {
  const { id, ...data } = eventData;
  try {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: data,
    });
    return event;
  } catch (err) {
    console.error("Error updating event:", err);
    throw new Error("Failed to update event");
  }
}
async function deleteEvent(eventId) {
  try {
    const event = await prisma.event.delete({
      where: { id: eventId },
    });
    return event;
  } catch (err) {
    console.error("Error deleting event:", err);
    throw new Error("Failed to delete event");
  }
}

module.exports = {
  deleteEvent,
  updateEvent,
  createEvent,
  getAllEvents,
};
