import React, { forwardRef } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon_Calendar from '../../../assets/SVG/Icon_Calendar';
import Input from './Input';

interface DateInputProps {
  value?: Date;
  mode?: 'date' | 'datetime' | 'time';
  onChange?: (date: Date) => void;
  error?: string;
  onSubmitEditing?: () => void;
  placeholder?: string;
  showPicker?: boolean;
  onPickerClose?: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
}

const DateInput = forwardRef<TextInput, DateInputProps>(
  (
    {
      value,
      mode = 'date',
      onChange,
      error,
      onSubmitEditing,
      placeholder = 'Select Date',
      showPicker,
      onPickerClose,
      minimumDate,
      maximumDate,
      minuteInterval,
    },
    ref,
  ) => {
    const [isPickerOpen, setIsPickerOpen] = React.useState(false);

    React.useEffect(() => {
      if (showPicker !== undefined) {
        setIsPickerOpen(showPicker);
      }
    }, [showPicker]);

    const handleDateChange = (selectedDate: Date) => {
      try {
        onChange?.(selectedDate);
        setIsPickerOpen(false);
        onPickerClose?.();
      } catch (err) {
        console.error('Error in handleDateChange:', err);
      }
    };

    const formattedDate = React.useMemo(() => {
      try {
        if (!value) return '';

        if (mode === 'datetime') {
          return value.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        } else if (mode === 'time') {
          return value.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        } else {
          return value.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        }
      } catch (err) {
        console.error('Error formatting date:', err);
        return '';
      }
    }, [value, mode]);

    return (
      <>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsPickerOpen(true)}
          style={{ width: '100%' }}>
          <Input
            ref={ref}
            iconLeft={<Icon_Calendar />}
            value={formattedDate}
            error={error}
            editable={false}
            style={{ color: 'black' }}
            placeholder={placeholder}
            returnKeyType="next"
            onSubmitEditing={onSubmitEditing}
            pointerEvents="none"
          />
        </TouchableOpacity>
        <DatePicker
          modal
          open={isPickerOpen}
          date={value || new Date()}
          onConfirm={date => {
            handleDateChange(date);
          }}
          onCancel={() => {
            setIsPickerOpen(false);
            onPickerClose?.();
          }}
          mode={mode}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          minuteInterval={minuteInterval}
          is24hourSource="locale"
        />
      </>
    );
  },
);

DateInput.displayName = 'DateInput';

export default DateInput;
