import React, { useRef } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
} from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';
import { COLORS } from '../../theme';

type OtpInputsProps = {
  control: Control<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
};

const OtpInputs: React.FC<OtpInputsProps> = ({ control, errors, setValue }) => {
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null]);

  return (
    <View style={styles.otpContainer}>
      {[0, 1, 2, 3].map(index => (
        <Controller
          key={index}
          control={control}
          name={`otp.${index}`}
          render={({ field: { onChange, value } }) => (
            <TextInput
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                (errors as any).otp?.[index] && styles.otpInputError,
              ]}
              value={value}
              onChangeText={text => {
                if (text && !/^[0-9]$/.test(text)) {
                  return;
                }

                if (!text && index > 0) {
                  setValue(`otp.${index}`, '');
                  inputRefs.current[index - 1]?.focus();
                } else {
                  onChange(text);
                  if (text && index < 3) {
                    inputRefs.current[index + 1]?.focus();
                  }
                }
              }}
              onKeyPress={e => {
                if (
                  e.nativeEvent.key === 'Backspace' &&
                  !value &&
                  index > 0
                ) {
                  setValue(`otp.${index}`, '');
                  inputRefs.current[index - 1]?.focus();
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          )}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  otpInput: {
    // width: 60,
    flex: 1,
    maxWidth:100,
    height: 60,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    color: COLORS.darkColor,
  },
  otpInputError: {
    borderColor: COLORS.errorColor,
  },
});

export default OtpInputs;

