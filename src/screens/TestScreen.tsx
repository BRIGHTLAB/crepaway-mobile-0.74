import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  TextInput,
  StyleSheet,
  Text,
  Platform,
  TouchableWithoutFeedback,
  Button,
  Keyboard,
  StatusBar,
} from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../components/UI/Input';

const TestScreen = () => {
  const verticalOffset =
    Platform.OS === 'ios'
      ? (StatusBar.currentHeight ?? 20) + 44
      : (StatusBar.currentHeight ?? 0);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
      keyboardVerticalOffset={verticalOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{
            flex: 1,
            gap: 10
          }}>
            <Text style={styles.header}>Header</Text>
            {Array.from({ length: 12 }).map((_, i) => (
              <Input
                key={i}
                placeholder={`Username ${i + 1}`}
              />
            ))}
            <View style={styles.btnContainer}>
              <Button title="Submit" onPress={() => null} />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'flex-start',
  },
  header: { fontSize: 36, marginBottom: 48 },
  textInput: {
    height: 40,
    borderColor: '#000',
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  btnContainer: { marginTop: 12 },
});

export default TestScreen;
