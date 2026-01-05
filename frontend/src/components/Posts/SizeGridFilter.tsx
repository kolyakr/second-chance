import { Box, Chip, Typography } from "@mui/material";

interface SizeGridFilterProps {
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
}

const commonSizes = [
  "XS", "S", "M", "L", "XL", "XXL",
  "36", "38", "40", "42", "44", "46", "48",
  "One Size", "Free Size"
];

const SizeGridFilter = ({ selectedSizes, onSizeToggle }: SizeGridFilterProps) => {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Розміри:
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1}>
        {commonSizes.map((size) => (
          <Chip
            key={size}
            label={size}
            onClick={() => onSizeToggle(size)}
            color={selectedSizes.includes(size) ? "primary" : "default"}
            variant={selectedSizes.includes(size) ? "filled" : "outlined"}
            sx={{ cursor: "pointer" }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SizeGridFilter;

