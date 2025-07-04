function getStrengthColor(level) {
  switch (level) {
    case "weak":
      return "#dc3545";
    case "fair":
      return "#fd7e14";
    case "good":
      return "#ffc107";
    case "strong":
      return "#28a745";
    default:
      return "#6c757d";
  }
}
