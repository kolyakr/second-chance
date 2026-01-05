import { Box, Button, Chip } from "@mui/material";
import { TrendingUp, NewReleases, AttachMoney } from "@mui/icons-material";

interface QuickFiltersProps {
  onFilterSelect: (filter: {
    maxPrice?: number;
    sortBy?: string;
    order?: string;
  }) => void;
}

const QuickFilters = ({ onFilterSelect }: QuickFiltersProps) => {
  const filters = [
    {
      label: "До 200₴",
      icon: <AttachMoney />,
      filter: { maxPrice: 200 },
    },
    {
      label: "До 500₴",
      icon: <AttachMoney />,
      filter: { maxPrice: 500 },
    },
    {
      label: "Нові надходження",
      icon: <NewReleases />,
      filter: { sortBy: "createdAt", order: "desc" },
    },
    {
      label: "Популярні",
      icon: <TrendingUp />,
      filter: { sortBy: "popularity", order: "desc" },
    },
  ];

  return (
    <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
      {filters.map((item, index) => (
        <Chip
          key={index}
          label={item.label}
          icon={item.icon}
          onClick={() => onFilterSelect(item.filter)}
          sx={{ cursor: "pointer" }}
          color="primary"
          variant="outlined"
        />
      ))}
    </Box>
  );
};

export default QuickFilters;

