export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  space: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  category: string;
  duration: string;
  seats?: Seat[][];
}

export interface Seat {
  id: string;
  row: number;
  number: number;
  status: 'available' | 'selected' | 'occupied';
  price: number;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  image: string;
  capacity: number;
  pricePerHour: number;
  amenities: string[];
  availability: string;
}

export interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  purchaseDate: string;
}

export interface SpaceRental {
  id: string;
  spaceId: string;
  spaceName: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  totalCost: number;
  submittedDate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

export interface FavoriteEvent {
  eventId: string;
  addedDate: string;
}
