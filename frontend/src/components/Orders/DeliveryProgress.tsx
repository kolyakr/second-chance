import { Box, Stepper, Step, StepLabel, Typography } from "@mui/material";
import {
  CheckCircle,
  Pending,
  LocalShipping,
  Cancel,
} from "@mui/icons-material";

interface DeliveryProgressProps {
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
}

const steps = [
  { label: "В очікуванні", value: "pending" },
  { label: "Підтверджено", value: "confirmed" },
  { label: "Відправлено", value: "shipped" },
  { label: "Доставлено", value: "delivered" },
];

export const DeliveryProgress = ({ status }: DeliveryProgressProps) => {
  const getActiveStep = () => {
    switch (status) {
      case "pending":
        return 0;
      case "confirmed":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      case "cancelled":
        return -1;
      default:
        return 0;
    }
  };

  const activeStep = getActiveStep();

  if (status === "cancelled") {
    return (
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 2,
            bgcolor: "error.light",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "error.main",
          }}
        >
          <Cancel color="error" />
          <Typography variant="body2" color="error.main" fontWeight={600}>
            Замовлення скасовано
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, width: "100%" }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;
          const isPending = index > activeStep;

          return (
            <Step key={step.value} completed={isCompleted}>
              <StepLabel
                StepIconComponent={() => {
                  if (isCompleted) {
                    return (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "success.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        <CheckCircle />
                      </Box>
                    );
                  }
                  if (isActive) {
                    return (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          border: "3px solid",
                          borderColor: "primary.light",
                        }}
                      >
                        {step.value === "pending" ? (
                          <Pending />
                        ) : step.value === "confirmed" ? (
                          <CheckCircle />
                        ) : step.value === "shipped" ? (
                          <LocalShipping />
                        ) : (
                          <CheckCircle />
                        )}
                      </Box>
                    );
                  }
                  return (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "grey.300",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "grey.600",
                      }}
                    >
                      <Pending />
                    </Box>
                  );
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isActive ? 700 : isCompleted ? 600 : 400,
                    color: isActive
                      ? "primary.main"
                      : isCompleted
                      ? "success.main"
                      : "text.secondary",
                  }}
                >
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};
