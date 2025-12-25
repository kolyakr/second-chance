import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Grid,
  Autocomplete,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Post } from "../api/postsApi";
import { paymentsApi, DeliveryAddress } from "../api/paymentsApi";
import { useAuthStore } from "../../auth/store/authStore";
import { PaymentForm } from "./PaymentForm";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  post: Post;
}

const ukrainianRegions = [
  "Вінницька область",
  "Волинська область",
  "Дніпропетровська область",
  "Донецька область",
  "Житомирська область",
  "Закарпатська область",
  "Запорізька область",
  "Івано-Франківська область",
  "Київська область",
  "Кіровоградська область",
  "Луганська область",
  "Львівська область",
  "Миколаївська область",
  "Одеська область",
  "Полтавська область",
  "Рівненська область",
  "Сумська область",
  "Тернопільська область",
  "Харківська область",
  "Херсонська область",
  "Хмельницька область",
  "Черкаська область",
  "Чернівецька область",
  "Чернігівська область",
];

const ukrainianCities = {
  "Вінницька область": [
    "Вінниця",
    "Жмеринка",
    "Козятин",
    "Могилів-Подільський",
  ],
  "Волинська область": ["Луцьк", "Ковель", "Нововолинськ", "Володимир"],
  "Дніпропетровська область": ["Дніпро", "Кривий Ріг", "Нікополь", "Павлоград"],
  "Донецька область": ["Донецьк", "Маріуполь", "Краматорськ", "Слов'янськ"],
  "Житомирська область": [
    "Житомир",
    "Бердичів",
    "Коростень",
    "Новоград-Волинський",
  ],
  "Закарпатська область": ["Ужгород", "Мукачеве", "Хуст", "Берегове"],
  "Запорізька область": ["Запоріжжя", "Мелітополь", "Бердянськ", "Енергодар"],
  "Івано-Франківська область": [
    "Івано-Франківськ",
    "Коломия",
    "Калуш",
    "Долина",
  ],
  "Київська область": ["Київ", "Біла Церква", "Бровари", "Вишгород"],
  "Кіровоградська область": [
    "Кропивницький",
    "Олександрія",
    "Світловодськ",
    "Знам'янка",
  ],
  "Луганська область": ["Луганськ", "Сєвєродонецьк", "Алчевськ", "Лисичанськ"],
  "Львівська область": ["Львів", "Дрогобич", "Стрий", "Червоноград"],
  "Миколаївська область": ["Миколаїв", "Первомайськ", "Вознесенськ", "Очаків"],
  "Одеська область": [
    "Одеса",
    "Ізмаїл",
    "Чорноморськ",
    "Білгород-Дністровський",
  ],
  "Полтавська область": ["Полтава", "Кременчук", "Лубни", "Миргород"],
  "Рівненська область": ["Рівне", "Дубно", "Костопіль", "Сарни"],
  "Сумська область": ["Суми", "Конотоп", "Шостка", "Ромни"],
  "Тернопільська область": ["Тернопіль", "Чортків", "Кременець", "Бережани"],
  "Харківська область": ["Харків", "Ізюм", "Куп'янськ", "Лозова"],
  "Херсонська область": ["Херсон", "Нова Каховка", "Каховка", "Скадовськ"],
  "Хмельницька область": [
    "Хмельницький",
    "Кам'янець-Подільський",
    "Шепетівка",
    "Нетішин",
  ],
  "Черкаська область": ["Черкаси", "Умань", "Сміла", "Золотоноша"],
  "Чернівецька область": [
    "Чернівці",
    "Сторожинець",
    "Новодністровськ",
    "Хотин",
  ],
  "Чернігівська область": ["Чернігів", "Ніжин", "Прилуки", "Бахмач"],
};

const validationSchema = Yup.object({
  fullName: Yup.string()
    .required("Повне ім'я обов'язкове")
    .min(2, "Ім'я повинно містити мінімум 2 символи")
    .max(100, "Ім'я повинно містити менше 100 символів"),
  email: Yup.string()
    .email("Невірна електронна адреса")
    .required("Електронна адреса обов'язкова"),
  phone: Yup.string()
    .required("Номер телефону обов'язковий")
    .matches(
      /^[\d\s\-\+\(\)]+$/,
      "Номер телефону може містити лише цифри, пробіли, тире та дужки"
    )
    .min(10, "Номер телефону повинен містити мінімум 10 цифр"),
  address: Yup.string()
    .required("Адреса обов'язкова")
    .min(5, "Адреса повинна містити мінімум 5 символів")
    .max(200, "Адреса повинна містити менше 200 символів"),
  city: Yup.string()
    .required("Місто обов'язкове")
    .min(2, "Місто повинно містити мінімум 2 символи")
    .max(100, "Місто повинно містити менше 100 символів"),
  state: Yup.string()
    .required("Область обов'язкова")
    .min(2, "Область повинна містити мінімум 2 символи")
    .max(100, "Область повинна містити менше 100 символів"),
  zipCode: Yup.string()
    .required("Поштовий індекс обов'язковий")
    .matches(/^\d{5}$/, "Поштовий індекс повинен містити 5 цифр")
    .min(5, "Поштовий індекс повинен містити 5 цифр")
    .max(5, "Поштовий індекс повинен містити 5 цифр"),
  country: Yup.string()
    .required("Країна обов'язкова")
    .oneOf(["Ukraine"], "Доставка доступна лише в Україну"),
});

const steps = ["Інформація про доставку", "Підсумок замовлення", "Оплата"];

export const CheckoutDialog = ({
  open,
  onClose,
  post,
}: CheckoutDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      fullName:
        user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.username || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Ukraine",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (activeStep === 0) {
        // Validate step 1 before proceeding
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
          formik.setTouched({
            fullName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
          });
          return;
        }
        setActiveStep(1);
        return;
      }

      if (activeStep === 1) {
        // Create order and payment intent
        setProcessing(true);
        try {
          const orderResult = await paymentsApi.createOrder({
            postId: post._id,
            deliveryAddress: values as DeliveryAddress,
          });

          if (orderResult.success) {
            // Create payment intent
            const paymentResult = await paymentsApi.createPaymentIntent(
              orderResult.data._id
            );

            if (paymentResult.success && paymentResult.data) {
              setClientSecret(paymentResult.data.clientSecret);
              setPaymentIntentId(paymentResult.data.paymentIntentId);
              setActiveStep(2);
            }
          }
        } catch (error: any) {
          toast.error(
            error.response?.data?.message || "Не вдалося створити замовлення"
          );
        } finally {
          setProcessing(false);
        }
        return;
      }
    },
  });

  useEffect(() => {
    // Reset city when region changes
    if (selectedRegion !== formik.values.state) {
      formik.setFieldValue("city", "");
    }
  }, [selectedRegion, formik.values.state]);

  const handlePaymentSuccess = async () => {
    if (!paymentIntentId) return;

    setProcessing(true);
    try {
      const result = await paymentsApi.confirmPayment(paymentIntentId);
      if (result.success) {
        toast.success("Платіж успішний! Ваше замовлення підтверджено.");
        onClose();
        formik.resetForm();
        setActiveStep(0);
        setClientSecret(null);
        setPaymentIntentId(null);
        // Navigate to orders page
        navigate("/orders");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Не вдалося підтвердити платіж");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const handleBack = () => {
    if (activeStep === 2) {
      setActiveStep(1);
      setClientSecret(null);
      setPaymentIntentId(null);
    } else if (activeStep === 1) {
      setActiveStep(0);
    }
  };

  const handleClose = () => {
    if (!processing) {
      onClose();
      formik.resetForm();
      setActiveStep(0);
      setClientSecret(null);
      setPaymentIntentId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight={700}>
          Оформлення замовлення
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {post.title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Інформація про доставку
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Повне ім'я"
                  name="fullName"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.fullName && Boolean(formik.errors.fullName)
                  }
                  helperText={formik.touched.fullName && formik.errors.fullName}
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Електронна адреса"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Номер телефону"
                  name="phone"
                  value={formik.values.phone}
                  onChange={(e) => {
                    // Format phone number as user types
                    const value = e.target.value.replace(
                      /[^\d\s\-\+\(\)]/g,
                      ""
                    );
                    formik.setFieldValue("phone", value);
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  size="small"
                  placeholder="+380 (XX) XXX-XXXX"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.address && Boolean(formik.errors.address)
                  }
                  helperText={formik.touched.address && formik.errors.address}
                  size="small"
                  placeholder="вул. Хрещатик, 1, кв. 5"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={ukrainianRegions}
                  value={formik.values.state}
                  onChange={(_, newValue) => {
                    formik.setFieldValue("state", newValue || "");
                    setSelectedRegion(newValue || "");
                    formik.setFieldValue("city", "");
                  }}
                  onBlur={() => formik.setFieldTouched("state", true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Область"
                      name="state"
                      error={
                        formik.touched.state && Boolean(formik.errors.state)
                      }
                      helperText={formik.touched.state && formik.errors.state}
                      size="small"
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={
                    formik.values.state &&
                    ukrainianCities[
                      formik.values.state as keyof typeof ukrainianCities
                    ]
                      ? ukrainianCities[
                          formik.values.state as keyof typeof ukrainianCities
                        ]
                      : []
                  }
                  value={formik.values.city || ""}
                  onChange={(_, newValue) => {
                    formik.setFieldValue("city", newValue || "");
                  }}
                  onBlur={() => formik.setFieldTouched("city", true)}
                  disabled={!formik.values.state}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Місто"
                      name="city"
                      error={formik.touched.city && Boolean(formik.errors.city)}
                      helperText={formik.touched.city && formik.errors.city}
                      size="small"
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Поштовий індекс"
                  name="zipCode"
                  value={formik.values.zipCode}
                  onChange={(e) => {
                    // Only allow 5 digits
                    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                    formik.setFieldValue("zipCode", value);
                  }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.zipCode && Boolean(formik.errors.zipCode)
                  }
                  helperText={formik.touched.zipCode && formik.errors.zipCode}
                  size="small"
                  placeholder="01001"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Країна"
                  name="country"
                  value={formik.values.country}
                  disabled
                  size="small"
                  required
                  helperText="Доставка тільки в Україну"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Підсумок замовлення
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="body2">Товар:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {post.title}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="body2">Ціна:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  ${post.price}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6">Всього:</Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  ${post.price}
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Адреса доставки:
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                {formik.values.fullName}
                <br />
                {formik.values.address}
                <br />
                {formik.values.city}, {formik.values.state}{" "}
                {formik.values.zipCode}
                <br />
                Україна
                <br />
                <br />
                <strong>Електронна адреса:</strong> {formik.values.email}
                <br />
                <strong>Телефон:</strong> {formik.values.phone}
              </Typography>
            </Paper>
          </Box>
        )}

        {activeStep === 2 && clientSecret && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Інформація про оплату
            </Typography>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                },
              }}
            >
              <PaymentForm
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                processing={processing}
                setProcessing={setProcessing}
              />
            </Elements>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={handleClose} disabled={processing}>
          Скасувати
        </Button>
        {activeStep > 0 && activeStep < 2 && (
          <Button onClick={handleBack} disabled={processing}>
            Назад
          </Button>
        )}
        {activeStep < 2 && (
          <Button
            variant="contained"
            onClick={() => formik.handleSubmit()}
            disabled={processing}
            sx={{
              px: 4,
              fontWeight: 600,
            }}
          >
            {processing
              ? "Обробка..."
              : activeStep === 0
              ? "Продовжити до замовлення"
              : "Продовжити до оплати"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
