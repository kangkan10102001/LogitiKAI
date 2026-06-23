import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CITIES = [
  { name: 'Delhi', state: 'Delhi NCR', type: 'metro', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', state: 'Maharashtra', type: 'metro', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', state: 'Karnataka', type: 'metro', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', state: 'Telangana', type: 'metro', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai', state: 'Tamil Nadu', type: 'metro', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', state: 'West Bengal', type: 'metro', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune', state: 'Maharashtra', type: 'metro', lat: 18.5204, lng: 73.8567 },
  { name: 'Guwahati', state: 'Assam', type: 'tier2', lat: 26.1445, lng: 91.7362 },
  { name: 'Jaipur', state: 'Rajasthan', type: 'tier2', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', state: 'Uttar Pradesh', type: 'tier2', lat: 26.8467, lng: 80.9462 },
  { name: 'Ahmedabad', state: 'Gujarat', type: 'tier2', lat: 23.0225, lng: 72.5714 },
  { name: 'Chandigarh', state: 'Punjab', type: 'tier2', lat: 30.7333, lng: 76.7794 },
];

const USERS = [
  { id: 'u-admin-001', email: 'admin@logistikai.in', name: 'Rajesh Sharma', phone: '+91 98765 43210', role: 'admin', city: 'Delhi' },
  { id: 'u-admin-002', email: 'admin2@logistikai.in', name: 'Anita Desai', phone: '+91 98765 43211', role: 'admin', city: 'Mumbai' },
  { id: 'u-mgr-001', email: 'manager@logistikai.in', name: 'Priya Patel', phone: '+91 87654 32109', role: 'manager', city: 'Mumbai' },
  { id: 'u-mgr-002', email: 'mgr-bang@logistikai.in', name: 'Vikram Reddy', phone: '+91 87654 32108', role: 'manager', city: 'Bangalore' },
  { id: 'u-mgr-003', email: 'mgr-del@logistikai.in', name: 'Amit Verma', phone: '+91 87654 32107', role: 'manager', city: 'Delhi' },
  { id: 'u-drv-001', email: 'driver@logistikai.in', name: 'Suresh Kumar', phone: '+91 76543 21098', role: 'driver', city: 'Bangalore' },
  { id: 'u-drv-002', email: 'drv2@logistikai.in', name: 'Mohan Singh', phone: '+91 76543 21097', role: 'driver', city: 'Delhi' },
  { id: 'u-drv-003', email: 'drv3@logistikai.in', name: 'Ravi Prasad', phone: '+91 76543 21096', role: 'driver', city: 'Mumbai' },
  { id: 'u-drv-004', email: 'drv4@logistikai.in', name: 'Karthik Nair', phone: '+91 76543 21095', role: 'driver', city: 'Chennai' },
  { id: 'u-drv-005', email: 'drv5@logistikai.in', name: 'Arjun Mehta', phone: '+91 76543 21094', role: 'driver', city: 'Hyderabad' },
  { id: 'u-drv-006', email: 'drv6@logistikai.in', name: 'Dinesh Yadav', phone: '+91 76543 21093', role: 'driver', city: 'Pune' },
  { id: 'u-drv-007', email: 'drv7@logistikai.in', name: 'Sanjay Gupta', phone: '+91 76543 21092', role: 'driver', city: 'Kolkata' },
  { id: 'u-drv-008', email: 'drv8@logistikai.in', name: 'Bharat Joshi', phone: '+91 76543 21091', role: 'driver', city: 'Guwahati' },
  { id: 'u-drv-009', email: 'drv9@logistikai.in', name: 'Ramesh Iyer', phone: '+91 76543 21090', role: 'driver', city: 'Jaipur' },
  { id: 'u-drv-010', email: 'drv10@logistikai.in', name: 'Manoj Tiwari', phone: '+91 76543 21089', role: 'driver', city: 'Lucknow' },
];

function getCityCoords(cityName: string): { lat: number; lng: number } {
  const city = CITIES.find(c => c.name === cityName);
  if (city) return { lat: city.lat, lng: city.lng };
  return { lat: 28.6139, lng: 77.2090 };
}

function randomOffset(baseLat: number, baseLng: number, range: number = 0.08): { lat: number; lng: number } {
  return {
    lat: baseLat + (Math.random() - 0.5) * range,
    lng: baseLng + (Math.random() - 0.5) * range,
  };
}

function randomPickupDropoff(city: string) {
  const coords = getCityCoords(city);
  const pickup = randomOffset(coords.lat, coords.lng, 0.12);
  const dropoff = randomOffset(coords.lat, coords.lng, 0.12);
  return { pickup, dropoff };
}

const ADDRESSES_DELHI = ['Connaught Place', 'Nehru Place', 'Karol Bagh', 'Lajpat Nagar', 'Dwarka Sector 12', 'Rohini Sector 7', 'Saket', 'GTB Nagar', 'Janakpuri', 'Rajouri Garden'];
const ADDRESSES_MUMBAI = ['Bandra Kurla Complex', 'Andheri East', 'Powai', 'Lower Parel', 'Thane West', 'Borivali', 'Vashi', 'Goregaon', 'Malad West', 'Kandivali East'];
const ADDRESSES_BANGALORE = ['Koramangala', 'Whitefield', 'Electronic City', 'HSR Layout', 'Indiranagar', 'Marathahalli', 'JP Nagar', 'Bellandur', 'Hennur', 'Rajajinagar'];
const ADDRESSES_HYDERABAD = ['HITEC City', 'Madhapur', 'Gachibowli', 'Kondapur', 'Begumpet', 'Secunderabad', 'Miyapur', 'Kukatpally', 'Jubilee Hills', 'Banjara Hills'];
const ADDRESSES_CHENNAI = ['T. Nagar', 'Velachery', 'OMR', 'Anna Nagar', 'Adyar', 'Porur', 'Sholinganallur', 'Guindy', 'Nungambakkam', 'Mogappair'];
const ADDRESSES_KOLKATA = ['Salt Lake', 'New Alipore', 'Howrah', 'Park Street', 'Gariahat', 'Dum Dum', 'Behala', 'Jadavpur', 'Lake Town', 'Baranagar'];

const CITY_ADDRESSES: Record<string, string[]> = {
  Delhi: ADDRESSES_DELHI, Mumbai: ADDRESSES_MUMBAI, Bangalore: ADDRESSES_BANGALORE,
  Hyderabad: ADDRESSES_HYDERABAD, Chennai: ADDRESSES_CHENNAI, Kolkata: ADDRESSES_KOLKATA,
  Pune: ['Hinjewadi', 'Kharadi', 'Viman Nagar', 'Baner', 'Wakad', 'Hadapsar', 'Pimpri', 'Aundh'],
  Guwahati: ['Pan Bazaar', 'GS Road', 'Beltola', 'Zoo Road', 'Six Mile', 'Ganeshguri', 'Lachit Nagar'],
  Jaipur: ['Vaishali Nagar', 'Malviya Nagar', 'Tonk Road', 'Mansarovar', 'C-Scheme', 'Jhotwara', 'Sanganer'],
  Lucknow: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Aminabad', 'Kanpur Road', 'Rajajipuram'],
  Ahmedabad: ['SG Highway', 'Bopal', 'Satellite', 'Navrangpura', 'Vastrapur', 'Maninagar', 'Bodakdev'],
  Chandigarh: ['Sector 17', 'Sector 22', 'Industrial Area', 'Mohali', 'Panchkula', 'Sector 35', 'IT Park'],
};

function getAddressesForCity(city: string): string[] {
  return CITY_ADDRESSES[city] || ADDRESSES_DELHI;
}

function randomPhone(): string {
  return `+91 ${Math.floor(70000 + Math.random() * 30000)} ${Math.floor(10000 + Math.random() * 90000)}`;
}

function randomPincode(city: string): string {
  const pincodes: Record<string, string> = {
    Delhi: '1100', Mumbai: '4000', Bangalore: '5600', Hyderabad: '5000',
    Chennai: '6000', Kolkata: '7000', Pune: '4110', Guwahati: '7810',
    Jaipur: '3020', Lucknow: '2260', Ahmedabad: '3800', Chandigarh: '1600',
  };
  const prefix = pincodes[city] || '1100';
  return `${prefix}${Math.floor(10 + Math.random() * 90)}`;
}

async function seed() {
  console.log('🌱 Seeding LogistiKAI database...');

  // Clean existing data
  await prisma.trackingPoint.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.city.deleteMany();

  // Create cities
  console.log('📍 Creating cities...');
  const cityRecords = await Promise.all(
    CITIES.map((c) => prisma.city.create({ data: c }))
  );
  const cityMap = new Map(cityRecords.map((c) => [c.name, c]));

  // Create users
  console.log('👥 Creating users...');
  await Promise.all(
    USERS.map((u) => prisma.user.create({ data: { ...u, isActive: true } }))
  );

  // Create vehicles
  console.log('🚛 Creating vehicles...');
  const vehicleTypes = ['truck', 'van', 'bike', 'tempo'] as const;
  const drivers = USERS.filter(u => u.role === 'driver');
  const vehicles: any[] = [];

  for (const city of CITIES) {
    const cityDrivers = drivers.filter(d => d.city === city.name);
    const vehicleCount = city.type === 'metro' ? 4 : 2;
    
    for (let i = 0; i < vehicleCount; i++) {
      const driver = cityDrivers[i % cityDrivers.length];
      const coords = getCityCoords(city.name);
      const pos = randomOffset(coords.lat, coords.lng, 0.06);
      
      const vehicle = await prisma.vehicle.create({
        data: {
          vehicleNo: `${city.name.substring(0, 2).toUpperCase()}-${String.fromCharCode(65 + i)}${String(Math.floor(1000 + Math.random() * 9000))}`,
          type: vehicleTypes[i % vehicleTypes.length],
          capacity: [500, 200, 50, 300][i % 4],
          fuelType: ['diesel', 'petrol', 'electric', 'diesel'][i % 4],
          status: i < 2 ? (Math.random() > 0.4 ? 'in_transit' : 'available') : 'available',
          currentLat: pos.lat,
          currentLng: pos.lng,
          lastUpdate: new Date(),
          totalKms: Math.floor(5000 + Math.random() * 50000),
          fuelEfficiency: 6 + Math.random() * 6,
          cityId: cityMap.get(city.name)!.id,
          driverId: driver?.id,
        },
      });
      vehicles.push(vehicle);
    }
  }

  // Create deliveries
  console.log('📦 Creating deliveries...');
  const statuses: Array<'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed'> = ['pending', 'assigned', 'in_transit', 'delivered', 'failed'];
  const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
  const recipientNames = ['Amit Jain', 'Sneha Kapoor', 'Deepak Rao', 'Meera Nair', 'Vikas Agarwal', 'Pooja Sharma', 'Rahul Menon', 'Kavitha Reddy', 'Arvind Das', 'Neha Saxena', 'Sunil Bhat', 'Divya Krishnan', 'Prakash Hegde', 'Shalini Gupta', 'Manish Pandey', 'Anjali Mishra', 'Kiran Rao', 'Swati Deshmukh', 'Tarun Grover', 'Ritu Verma'];
  
  const inTransitVehicles = vehicles.filter(v => v.status === 'in_transit');

  for (let i = 0; i < 48; i++) {
    const city = CITIES[i % CITIES.length];
    const addresses = getAddressesForCity(city.name);
    const pickupAddr = addresses[Math.floor(Math.random() * addresses.length)];
    let dropoffAddr = addresses[Math.floor(Math.random() * addresses.length)];
    while (dropoffAddr === pickupAddr) {
      dropoffAddr = addresses[Math.floor(Math.random() * addresses.length)];
    }

    const coords = getCityCoords(city.name);
    const pickup = randomOffset(coords.lat, coords.lng, 0.1);
    const dropoff = randomOffset(coords.lat, coords.lng, 0.1);
    const dist = Math.sqrt(Math.pow((pickup.lat - dropoff.lat) * 111, 2) + Math.pow((pickup.lng - dropoff.lng) * 85, 2));
    
    const statusIdx = i < 6 ? 0 : i < 12 ? 1 : i < 28 ? 2 : i < 42 ? 3 : 4;
    const status = statuses[statusIdx];
    
    const vehicle = status === 'in_transit' ? inTransitVehicles[i % inTransitVehicles.length] : null;
    
    const now = new Date();
    const scheduledPickup = new Date(now.getTime() - (Math.random() * 48 * 60 * 60 * 1000));
    const scheduledDelivery = new Date(scheduledPickup.getTime() + dist * 3 * 60 * 1000);

    const trackingNo = `LK${String(2026000001 + i).padStart(10, '0')}`;

    await prisma.delivery.create({
      data: {
        trackingNo,
        status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        pickupAddress: `${pickupAddr}, ${city.name}`,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        pickupCity: city.name,
        dropoffAddress: `${dropoffAddr}, ${city.name}`,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        dropoffCity: city.name,
        estimatedDistance: Math.round(dist * 10) / 10,
        estimatedTime: Math.round(dist * 3),
        actualDistance: status === 'delivered' || status === 'failed' ? Math.round(dist * (0.9 + Math.random() * 0.3) * 10) / 10 : null,
        actualTime: status === 'delivered' ? Math.round(dist * (2.5 + Math.random() * 2)) : null,
        scheduledPickup,
        scheduledDelivery,
        actualPickup: (status === 'in_transit' || status === 'delivered' || status === 'failed') ? new Date(scheduledPickup.getTime() + Math.random() * 30 * 60 * 1000) : null,
        actualDelivery: status === 'delivered' ? new Date(scheduledDelivery.getTime() - Math.random() * 60 * 60 * 1000) : null,
        recipientName: recipientNames[Math.floor(Math.random() * recipientNames.length)],
        recipientPhone: randomPhone(),
        recipientPincode: randomPincode(city.name),
        weight: Math.floor(1 + Math.random() * 49),
        codAmount: Math.random() > 0.5 ? Math.floor(500 + Math.random() * 9500) : null,
        remarks: Math.random() > 0.7 ? 'Handle with care - fragile items' : null,
        currentLat: status === 'in_transit' ? (pickup.lat + dropoff.lat) / 2 + (Math.random() - 0.5) * 0.02 : null,
        currentLng: status === 'in_transit' ? (pickup.lng + dropoff.lng) / 2 + (Math.random() - 0.5) * 0.02 : null,
        cityId: cityMap.get(city.name)!.id,
        vehicleId: vehicle?.id,
        driverId: vehicle?.driverId,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`   Cities: ${cityRecords.length}`);
  console.log(`   Users: ${USERS.length}`);
  console.log(`   Vehicles: ${vehicles.length}`);
  console.log(`   Deliveries: 48`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());