import React, { useState } from "react";
import { TrendingUp, Users, Camera, MapPin, Calendar, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function ObservationDashboard() {
  const [timeRange, setTimeRange] = useState("week");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample data for smooth curves
  const observationData = [
    { month: "Jan", animals: 45, plants: 32, environmental: 18 },
    { month: "Feb", animals: 52, plants: 38, environmental: 22 },
    { month: "Mar", animals: 61, plants: 45, environmental: 28 },
    { month: "Apr", animals: 58, plants: 51, environmental: 25 },
    { month: "May", animals: 70, plants: 58, environmental: 32 },
    { month: "Jun", animals: 78, plants: 65, environmental: 38 },
  ];

  const contributorData = [
    { month: "Jan", contributors: 120 },
    { month: "Feb", contrib