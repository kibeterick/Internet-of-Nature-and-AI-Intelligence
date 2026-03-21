import { useState, useEffect } from "react";
import { Calendar, Filter, Search, MapPin, Camera } from "lucide-react";

interface Sighting {
  id: string;
  speciesName: string;
  scientificName: string;
  category: "bird" | "mammal" | "insect" | "plant" | "reptile" | "amphibian";
  location: string;
  coordinates: { lat: number; lng: number };
  date: Date;
  time: string;
  notes: string;
  imageUrl?: string;
  weather: string;
  temperature: number;
}

const SpeciesTracking = () => {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [filteredSightings, setFilteredSightings] = useState<Sighting[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "species" | "location">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Load sightings from localStorage
  useEffect(() => {
    const savedSightings = localStorage.getItem("mySightings");
    if (savedSightings) {
      const parsed = JSON.parse(savedSightings);
      const withDates = parsed.map((s: any) => ({
        ...s,
        date: new Date(s.date),
      }));
      setSightings(withDates);
      setFilteredSightings(withDates);
    } else {
      // Demo data
      const demoSightings: Sighting[] = [
        {
          id: "1",
          speciesName: "Blue Jay",
          scientificName: "Cyanocitta cristata",
          category: "bird",
          location: "Central Park, NY",
          coordinates: { lat: 40.785091, lng: -73.968285 },
          date: new Date("2024-03-10"),
          time: "08:30 AM",
          notes: "Beautiful blue plumage, very vocal",
          weather: "Sunny",
          temperature: 18,
        },
        {
          id: "2",
          speciesName: "Monarch Butterfly",
          scientificName: "Danaus plexippus",
          category: "insect",
          location: "Butterfly Garden",
          coordinates: { lat: 40.758896, lng: -73.98513 },
          date: new Date("2024-03-12"),
          time: "02:15 PM",
          notes: "Feeding on milkweed flowers",
          weather: "Partly Cloudy",
          temperature: 22,
        },
        {
          id: "3",
          speciesName: "Red Fox",
          scientificName: "Vulpes vulpes",
          category: "mammal",
          location: "Forest Trail",
          coordinates: { lat: 40.712776, lng: -74.005974 },
          date: new Date("2024-03-08"),
          time: "06:45 AM",
          notes: "Spotted near den entrance",
          weather: "Foggy",
          temperature: 12,
        },
      ];
      setSightings(demoSightings);
      setFilteredSightings(demoSightings);
      localStorage.setItem("mySightings", JSON.stringify(demoSightings));
    }
  }, []);

  // Filter and sort
  useEffect(() => {
    let result = [...sightings];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (s) =>
          s.speciesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.location.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      result = result.filter((s) => s.category === filterCategory);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case "species":
          comparison = a.speciesName.localeCompare(b.speciesName);
          break;
        case "location":
          comparison = a.location.localeCompare(b.location);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredSightings(result);
  }, [searchTerm, filterCategory, sortBy, sortOrder, sightings]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      bird: "bg-blue-100 text-blue-800",
      mammal: "bg-orange-100 text-orange-800",
      insect: "bg-green-100 text-green-800",
      plant: "bg-emerald-100 text-emerald-800",
      reptile: "bg-yellow-100 text-yellow-800",
      amphibian: "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">My Sightings</h1>
        <p className="text-gray-600">Your personal species observation log</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search species or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="bird">Birds</option>
              <option value="mammal">Mammals</option>
              <option value="insect">Insects</option>
              <option value="plant">Plants</option>
              <option value="reptile">Reptiles</option>
              <option value="amphibian">Amphibians</option>
            </select>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="species">Sort by Species</option>
            <option value="location">Sort by Location</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredSightings.length} of {sightings.length} sightings
        </div>
      </div>

      {/* Sightings List */}
      <div className="space-y-4">
        {filteredSightings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Camera size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No sightings found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or add your first sighting!
            </p>
          </div>
        ) : (
          filteredSightings.map((sighting) => (
            <div
              key={sighting.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {sighting.speciesName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(sighting.category)}`}
                    >
                      {sighting.category}
                    </span>
                  </div>
                  <p className="text-gray-600 italic mb-3">
                    {sighting.scientificName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar size={16} />
                    <span>{sighting.date.toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-gray-500">{sighting.time}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin
                    size={18}
                    className="text-blue-500 mt-1 flex-shrink-0"
                  />
                  <div>
                    <div className="font-semibold text-gray-700">Location</div>
                    <div className="text-gray-600">{sighting.location}</div>
                    <div className="text-xs text-gray-500">
                      {sighting.coordinates.lat.toFixed(4)},{" "}
                      {sighting.coordinates.lng.toFixed(4)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-gray-700 mb-1">
                    Conditions
                  </div>
                  <div className="text-gray-600">
                    {sighting.weather} • {sighting.temperature}°C
                  </div>
                </div>
              </div>

              {sighting.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-2">Notes</div>
                  <p className="text-gray-600">{sighting.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SpeciesTracking;
