import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../theme';

type ResendOtpSectionProps = {
  labelText?: string;
  buttonText?: string;
  initialSeconds?: number;
  onResend: () => Promise<void> | void;
};

const ResendOtpSection: React.FC<ResendOtpSectionProps> = ({
  labelText = "Didn't receive an OTP?",
  buttonText = 'Resend Now',
  initialSeconds = 60,
  onResend,
}) => {
  const [countdown, setCountdown] = useState(initialSeconds);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePress = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    try {
      await onResend();
      setCountdown(initialSeconds);
      setCanResend(false);
    } catch {
      // Parent handles error UI; keep canResend true so user can try again
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.resendContainer}>
      <Text style={styles.resendText}>{labelText} </Text>
      <TouchableOpacity
        onPress={handlePress}
        disabled={!canResend || isResending}>
        <View style={styles.resendButtonContainer}>
          <Text
            style={[
              styles.resendButton,
              (!canResend || isResending) && styles.resendButtonDisabled,
              isResending && styles.resendButtonLoading,
            ]}>
            {isResending
              ? 'Resending...'
              : `${buttonText} ${
                  !canResend ? `(${formatTime(countdown)})` : ''
                }`}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resendText: {
    color: COLORS.foregroundColor,
    fontSize: 14,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  resendButtonDisabled: {
    color: COLORS.foregroundColor,
  },
  resendButtonLoading: {
    opacity: 0.6,
  },
  resendButtonContainer: {
    minWidth: 100,
    alignItems: 'center',
  },
});

export default ResendOtpSection;
