export const applyFilters = (data, filters) => {
  if (!filters || filters.length === 0) return data;
  return data.filter((row) => {
    return filters.every((f) => {
      if (!f.column || !f.value || f.value.trim() === "") return true;
      const cellValue = String(row[f.column] || "").toLowerCase();
      const filterValue = f.value.toLowerCase();
      switch (f.operator) {
        case "equals":
          return cellValue === filterValue;
        case "contains":
          return cellValue.includes(filterValue);
        case "starts_with":
          return cellValue.startsWith(filterValue);
        default:
          return true;
      }
    });
  });
};