import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";
import { QuestionAnswer, Send, Delete } from "@mui/icons-material";
import { useAuthStore } from "../../features/auth/store/authStore";
import { questionService } from "../../services/questionService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

interface QuestionsSectionProps {
  postId: string;
  postOwnerId: string;
}

const QuestionsSection = ({ postId, postOwnerId }: QuestionsSectionProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const [questionText, setQuestionText] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["questions", postId],
    queryFn: () => questionService.getPostQuestions(postId),
  });

  const createQuestionMutation = useMutation({
    mutationFn: (content: string) => questionService.createQuestion(postId, content),
    onSuccess: () => {
      setQuestionText("");
      queryClient.invalidateQueries({ queryKey: ["questions", postId] });
      toast.success("Питання додано");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Не вдалося додати питання");
    },
  });

  const answerQuestionMutation = useMutation({
    mutationFn: ({ id, answer }: { id: string; answer: string }) =>
      questionService.answerQuestion(id, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", postId] });
      toast.success("Відповідь додано");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Не вдалося додати відповідь");
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: questionService.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", postId] });
      toast.success("Питання видалено");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Не вдалося видалити питання");
    },
  });

  const handleSubmit = () => {
    if (!questionText.trim()) return;
    createQuestionMutation.mutate(questionText);
  };

  const questions = data?.data || [];

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <QuestionAnswer /> Питання та відповіді
      </Typography>

      {isAuthenticated && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Задайте питання про товар..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleSubmit}
            disabled={!questionText.trim() || createQuestionMutation.isPending}
          >
            Задати питання
          </Button>
        </Paper>
      )}

      {isLoading ? (
        <Typography>Завантаження...</Typography>
      ) : questions.length === 0 ? (
        <Typography color="text.secondary">
          Питань поки немає. Станьте першим!
        </Typography>
      ) : (
        <Stack spacing={2}>
          {questions.map((question) => (
            <Paper key={question._id} sx={{ p: 2 }}>
              <Box display="flex" gap={2}>
                <Avatar src={question.user.avatar} sx={{ width: 40, height: 40 }}>
                  {question.user.username[0]}
                </Avatar>
                <Box flexGrow={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography fontWeight={600}>{question.user.username}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(question.createdAt), "dd MMM yyyy", { locale: uk })}
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    {question.content}
                  </Typography>

                  {question.answer && (
                    <Box
                      sx={{
                        bgcolor: "grey.50",
                        p: 2,
                        borderRadius: 1,
                        mt: 2,
                        borderLeft: "3px solid",
                        borderColor: "primary.main",
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography fontWeight={600} color="primary">
                          Відповідь від продавця
                        </Typography>
                        {question.answeredBy && (
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(question.answeredAt!), "dd MMM yyyy", { locale: uk })}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2">{question.answer}</Typography>
                    </Box>
                  )}

                  {!question.answer &&
                    String(user?.id) === postOwnerId &&
                    isAuthenticated && (
                      <Box mt={2}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Відповісти на питання..."
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              const answer = (e.target as HTMLInputElement).value;
                              if (answer.trim()) {
                                answerQuestionMutation.mutate({
                                  id: question._id,
                                  answer,
                                });
                                (e.target as HTMLInputElement).value = "";
                              }
                            }
                          }}
                        />
                      </Box>
                    )}
                </Box>
                {isAuthenticated &&
                  (String(user?.id) === question.user._id ||
                    String(user?.id) === postOwnerId) && (
                    <IconButton
                      size="small"
                      onClick={() => deleteQuestionMutation.mutate(question._id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default QuestionsSection;

