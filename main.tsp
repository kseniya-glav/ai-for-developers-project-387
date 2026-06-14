import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

@service
@doc("Booking API — a Cal.com-inspired scheduling service. Owner manages event types and views bookings; Guest browses event types and books free slots.")
@server("http://localhost:3000", "Local development")
namespace BookingApi {

  // ─── Enums ────────────────────────────────────────────────────────────────

  enum BookingStatus {
    confirmed,
  }

  // ─── Owner Model ──────────────────────────────────────────────────────────

  model Owner {
    id: string;
    name: string;
    email: string;
  }

  // ─── Error Models ─────────────────────────────────────────────────────────

  @error
  model NotFoundError {
    @statusCode statusCode: 404;
    code: "NOT_FOUND";
    message: string;
  }

  @error
  model ConflictError {
    @statusCode statusCode: 409;
    code: "CONFLICT";
    message: string;
  }

  @error
  model BadRequestError {
    @statusCode statusCode: 400;
    code: "BAD_REQUEST";
    message: string;
  }

  // ─── Event Type Models ────────────────────────────────────────────────────

  @resource("event-types")
  model EventType {
    @key("eventTypeId")
    id: string;

    title: string;

    @maxLength(2000)
    description: string;

    @minValue(15)
    @maxValue(480)
    durationMinutes: integer;
  }

  model EventTypeCreate {
    title: string;

    @maxLength(2000)
    description: string;

    @minValue(15)
    @maxValue(480)
    durationMinutes: integer;
  }

  // ─── Slot Model (computed) ────────────────────────────────────────────────

  model Slot {
    startTime: utcDateTime;
    endTime: utcDateTime;
    eventTypeId: string;
  }

  // ─── Booking Models ───────────────────────────────────────────────────────

  @resource("bookings")
  model Booking {
    @key("bookingId")
    id: string;

    eventTypeId: string;

    startTime: utcDateTime;

    endTime: utcDateTime;

    status: BookingStatus;

    guestName: string;

    @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
    guestEmail: string;

    @visibility(Lifecycle.Read)
    createdAt: utcDateTime;
  }

  model BookingCreate {
    eventTypeId: string;

    startTime: utcDateTime;

    guestName: string;

    @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
    guestEmail: string;
  }

  // ─── Event Types Interface ────────────────────────────────────────────────

  @route("/owner")
  interface OwnerApi {
    @get
    get(): Owner;
  }

  @route("/event-types")
  interface EventTypes {
    @post
    create(@body payload: EventTypeCreate): EventType | BadRequestError;

    @get
    list(): EventType[];

    @get
    @route("{eventTypeId}/slots")
    getSlots(
      @path eventTypeId: string,
      @query startDate?: plainDate
    ): Slot[] | NotFoundError | BadRequestError;
  }

  // ─── Bookings Interface ───────────────────────────────────────────────────

  @route("/bookings")
  interface Bookings {
    @post
    create(@body payload: BookingCreate): Booking | ConflictError | NotFoundError | BadRequestError;

    @get
    list(): Booking[];
  }
}
