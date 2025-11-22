// app/(app)/quizGame.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { GUEST_QUIZ_DATA, Question } from '../../constants/StaticData';
import { API_BASE_URL } from '../../constants/Config';

export default function QuizGameScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { categoryId, levelId } = useLocalSearchParams(); 
  const { isGuest, completeQuizLevel } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    loadQuestions();
  }, [categoryId, levelId]);

  const loadQuestions = async () => {
      setIsLoading(true);
      // Convert params to strings
      const catIdStr = categoryId?.toString() || '';
      const lvlIdStr = levelId?.toString() || '';

      if (!catIdStr || !lvlIdStr) {
          Alert.alert("Error", "Invalid quiz level.");
          router.back();
          return;
      }

      if (isGuest) {
          // --- GUEST MODE ---
          const category = GUEST_QUIZ_DATA.find(c => c.id === catIdStr);
          const level = category?.levels.find(l => l.id === lvlIdStr);
          if (level) {
              setQuestions(level.questions);
          } else {
              Alert.alert("Error", "Guest level data not found.");
              router.back();
          }
          setIsLoading(false);
      } else {
          // --- LOGGED-IN MODE ---
          try {
            // Call API with the numeric level_id from the DB
            const response = await fetch(`${API_BASE_URL}/get_quiz.php?level_id=${lvlIdStr}`);
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                setQuestions(data);
            } else {
                throw new Error("No questions found for this level.");
            }
          } catch (error) {
            console.error("Failed to fetch questions:", error);
            Alert.alert("Sorry", "We couldn't load the questions for this level yet. Please try another.");
            router.back();
          } finally {
            setIsLoading(false);
          }
      }
  };

  const handleOptionPress = (index: number) => {
      if (isAnswerChecked) return;
      setSelectedOptionIndex(index);
  };

  const handleCheckAnswer = () => {
      setIsAnswerChecked(true);
      // Handle differences in data structure (API vs Static)
      // Static uses 'correct_index' (number), API usually sends 'correct_answer' (string 'a','b','c','d')
      const currentQ = questions[currentQuestionIndex];
      let isCorrect = false;

      if ('correct_index' in currentQ) {
          // Static Data format
           isCorrect = selectedOptionIndex === (currentQ as any).correct_index;
      } else {
          // API Data format (assumes options are [a,b,c,d])
          const letter = ['a', 'b', 'c', 'd'][selectedOptionIndex!];
          isCorrect = letter === currentQ.correct_answer;
      }

      if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
      if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(i => i + 1);
          setSelectedOptionIndex(null);
          setIsAnswerChecked(false);
      } else {
          finishQuiz();
      }
  };

  const finishQuiz = () => {
      // Simple scoring: 10 pts per correct answer.
      const calculatedPoints = score * 10; 
      setPointsEarned(calculatedPoints);
      setQuizComplete(true);

      if (categoryId && levelId) {
           completeQuizLevel(categoryId.toString(), levelId.toString(), calculatedPoints);
      }
  };

  if (isLoading) {
      return (<SafeAreaView style={[styles.container, {backgroundColor: colors.background, justifyContent:'center', alignItems: 'center'}]}><ActivityIndicator size="large" color={colors.primary}/><Text style={{color: colors.subtext, marginTop: 20}}>Loading Questions...</Text></SafeAreaView>);
  }

  if (quizComplete) {
      return (
          <SafeAreaView style={[styles.container, { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
              <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
                  <Ionicons name="trophy" size={80} color="#F59E0B" />
                  <Text style={[styles.resultTitle, { color: colors.text }]}>Level Complete!</Text>
                  <View style={styles.scoreContainer}>
                      <Text style={[styles.resultScore, { color: colors.primary }]}>{score} / {questions.length}</Text>
                      <Text style={[styles.resultSub, { color: colors.subtext }]}>Correct Answers</Text>
                  </View>
                  <View style={[styles.pointsBadge, { backgroundColor: colors.secondary }]}>
                       <Text style={[styles.pointsText, { color: colors.primary }]}>+{pointsEarned} Points Earned</Text>
                  </View>
                  <TouchableOpacity style={[styles.finishButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
                      <Text style={[styles.buttonText, { color: colors.card }]}>Continue Journey</Text>
                  </TouchableOpacity>
              </View>
          </SafeAreaView>
      );
  }

  const currentQ = questions[currentQuestionIndex];
  // Handle both data formats for options
  const options = currentQ.options || [currentQ.option_a, currentQ.option_b, currentQ.option_c, currentQ.option_d];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color={colors.subtext} /></TouchableOpacity>
          <View style={[styles.progressBarBg, { backgroundColor: colors.lightGray }]}>
              <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }]} />
          </View>
          <Text style={{ color: colors.subtext, fontWeight: 'bold' }}>{currentQuestionIndex + 1}/{questions.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.questionText, { color: colors.text }]}>{currentQ.question || currentQ.text}</Text>
          {options.map((option, index) => {
              let optionColor = colors.card;
              let borderColor = 'transparent';
              let textColor = colors.text;
              // ... (Complex coloring logic - same as before)
              if (isAnswerChecked) {
                   // Need to determine correct index for both data formats
                   let isCorrectIndex = false;
                   if ('correct_index' in currentQ) isCorrectIndex = index === (currentQ as any).correct_index;
                   else isCorrectIndex = ['a','b','c','d'][index] === currentQ.correct_answer;

                  if (isCorrectIndex) {
                      optionColor = '#DCFCE7'; borderColor = colors.success; textColor = colors.success;
                  } else if (index === selectedOptionIndex) {
                      optionColor = '#FEE2E2'; borderColor = colors.error; textColor = colors.error;
                  }
              } else if (index === selectedOptionIndex) {
                  borderColor = colors.primary; optionColor = colors.secondary;
              }

              return (
                  <TouchableOpacity key={index} style={[styles.optionButton, { backgroundColor: optionColor, borderColor, borderWidth: 2 }]} onPress={() => handleOptionPress(index)} disabled={isAnswerChecked}>
                      <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                      {/* Add check/cross icons here based on same isCorrectIndex logic if desired */}
                  </TouchableOpacity>
              );
          })}
          {isAnswerChecked && (
              <View style={[styles.explanationBox, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.explanationTitle, { color: colors.primary }]}>Did you know?</Text>
                  <Text style={[styles.explanationText, { color: colors.text }]}>{currentQ.explanation}</Text>
              </View>
          )}
      </ScrollView>
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={[styles.mainButton, { backgroundColor: colors.primary, opacity: (selectedOptionIndex === null && !isAnswerChecked) ? 0.5 : 1 }]} onPress={isAnswerChecked ? handleNext : handleCheckAnswer} disabled={selectedOptionIndex === null && !isAnswerChecked}>
              <Text style={[styles.buttonText, { color: 'white' }]}>{isAnswerChecked ? (currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz") : "Check Answer"}</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 }, progressBarBg: { flex: 1, height: 8, borderRadius: 4, marginHorizontal: 15 }, progressBarFill: { height: '100%', borderRadius: 4 }, scrollContent: { padding: 20 }, questionText: { ...FONTS.h2, marginBottom: 30, lineHeight: 32 }, optionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 1 }, optionText: { ...FONTS.body3, flex: 1, fontWeight: '500' }, explanationBox: { padding: 16, borderRadius: 16, marginTop: 10, marginBottom: 20 }, explanationTitle: { ...FONTS.h3, marginBottom: 5, fontWeight: 'bold' }, explanationText: { ...FONTS.body4, lineHeight: 22 }, footer: { padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }, mainButton: { padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity:0.2, shadowRadius:8, elevation: 4 }, buttonText: { ...FONTS.h3, fontWeight: 'bold' }, resultCard: { width: '85%', padding: 40, borderRadius: 32, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: {width:0, height:10} }, resultTitle: { ...FONTS.h1, marginTop: 20, textAlign: 'center' }, scoreContainer: { alignItems: 'center', marginVertical: 20 }, resultScore: { fontSize: 64, fontWeight: '900', lineHeight: 80 }, resultSub: { ...FONTS.body3, opacity: 0.7 }, pointsBadge: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 30 }, pointsText: { ...FONTS.h3, fontWeight: 'bold' }, finishButton: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, width: '100%', alignItems: 'center' } });