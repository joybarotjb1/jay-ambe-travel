export const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", 
  "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", 
  "Bhopal", "Patna", "Vadodara", "Ludhiana", "Agra", "Nashik", "Faridabad", 
  "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", 
  "Amritsar", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", 
  "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", 
  "Chandigarh", "Guwahati", "Solapur", "Hubli", "Mysore", "Tiruchirappalli", 
  "Bareilly", "Aligarh", "Moradabad", "Mangalore", "Tirunelveli", "Goa", 
  "Shimla", "Dehradun", "Rishikesh", "Haridwar", "Udaipur", "Jamshedpur", 
  "Gandhinagar", "Pondicherry"
];

export interface Bus {
  id: string;
  name: string;
  type: string;
  depTime: string;
  arrTime: string;
  duration: string;
  fare: number;
  totalSeats: number;
  availableSeats: number;
  rating: number;
  amenities: string[];
}

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const BUS_TYPES = [
  "AC Sleeper",
  "Non-AC Sleeper",
  "AC Seater",
  "Volvo Multi-Axle",
  "Mercedes Luxury"
];

const AMENITIES = ["WiFi", "Water Bottle", "Blanket", "Charging Point", "Reading Light", "Live Tracking"];

export function generateBuses(from: string, to: string, date: string): Bus[] {
  const seed = hashString(`${from}-${to}-${date}`);
  const count = 6 + (seed % 5); // 6 to 10 buses

  const buses: Bus[] = [];
  for (let i = 0; i < count; i++) {
    const busSeed = seed + i;
    const type = BUS_TYPES[busSeed % BUS_TYPES.length];
    const baseFare = 800 + (busSeed % 1500);
    const fare = type.includes("Volvo") || type.includes("Mercedes") ? baseFare + 1000 : baseFare;
    
    const depHour = 16 + (busSeed % 8); // Evening departures 16:00 to 23:00
    const durationHours = 6 + (busSeed % 10);
    const durationMins = (busSeed % 4) * 15;
    
    let arrHour = depHour + durationHours;
    let nextDay = false;
    if (arrHour >= 24) {
      arrHour -= 24;
      nextDay = true;
    }
    
    const totalSeats = type.includes("Sleeper") ? 30 : 45;
    const booked = Math.floor(totalSeats * 0.3) + (busSeed % Math.floor(totalSeats * 0.4));
    const availableSeats = totalSeats - booked;

    buses.push({
      id: `bus-${busSeed}`,
      name: "Jay Ambe Travels",
      type,
      depTime: `${depHour.toString().padStart(2, "0")}:00`,
      arrTime: `${arrHour.toString().padStart(2, "0")}:${durationMins.toString().padStart(2, "0")}${nextDay ? ' (Next Day)' : ''}`,
      duration: `${durationHours}h ${durationMins}m`,
      fare,
      totalSeats,
      availableSeats,
      rating: 3.5 + ((busSeed % 15) / 10), // 3.5 to 4.9
      amenities: AMENITIES.filter((_, index) => (busSeed & (1 << index)) !== 0).slice(0, 4)
    });
  }

  return buses.sort((a, b) => a.depTime.localeCompare(b.depTime));
}

export function getBookedSeats(busId: string, totalSeats: number): string[] {
  const seed = hashString(busId);
  const bookedCount = Math.floor(totalSeats * 0.3) + (seed % Math.floor(totalSeats * 0.4));
  
  const booked = new Set<string>();
  const isSleeper = totalSeats === 30; // approx
  
  const rows = totalSeats / (isSleeper ? 3 : 4); // basic heuristic
  
  while (booked.size < bookedCount) {
    const seatSeed = seed + booked.size * 17;
    const r = (seatSeed % Math.floor(rows)) + 1;
    let s = "";
    if (isSleeper) {
      const type = seatSeed % 2 === 0 ? "L" : "U"; // Lower / Upper
      const pos = ["A", "B", "C"][seatSeed % 3];
      s = `${type}${r}${pos}`;
    } else {
      const pos = ["A", "B", "C", "D"][seatSeed % 4];
      s = `${r}${pos}`;
    }
    booked.add(s);
  }
  
  return Array.from(booked);
}